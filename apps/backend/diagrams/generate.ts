import {
  Project,
  ClassDeclaration,
  Decorator,
  MethodDeclaration,
  PropertyDeclaration,
  ObjectLiteralExpression,
} from 'ts-morph';
import * as fs from 'fs';

function getDecorators(decorators: Decorator[]): string[] {
  return decorators.map((decorator) => decorator.getName());
}

function replaceImportsWithObject(type: string): string {
  if (type.match(/import/g) || type.startsWith('{')) {
    return 'Object';
  }

  if (type.startsWith('Promise<{')) {
    return 'Promise<Object>';
  }

  if (type.startsWith('(')) {
    return 'function';
  }

  return type;
}

function extractClassDetails(cls: ClassDeclaration) {
  const attributes = cls.getProperties().map((prop: PropertyDeclaration) => ({
    name: prop.getName(),
    type: replaceImportsWithObject(prop.getType().getText()),
  }));

  const methods = cls.getMethods().map((method: MethodDeclaration) => ({
    name: method.getName(),
    returnType: replaceImportsWithObject(method.getReturnType().getText()),
    parameters: method.getParameters().map((param) => ({
      name: param.getName(),
      type: replaceImportsWithObject(param.getType().getText()),
    })),
  }));

  return { attributes, methods };
}

function sanitizeDependency(dep: string): string | null {
  return dep.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)
    ? dep.replace(/[^a-zA-Z0-9_]/g, '_')
    : null;
}

function extractModuleDependencies(decorator: Decorator) {
  const dependencies: string[] = [];
  const args = decorator.getArguments();

  if (args.length > 0) {
    const metadata = args[0] as ObjectLiteralExpression;
    const importsProperty = metadata.getProperty('imports');
    const providersProperty = metadata.getProperty('providers');
    const controllersProperty = metadata.getProperty('controllers');

    [importsProperty, providersProperty, controllersProperty].forEach(
      (property) => {
        if (property) {
          const initializer = (property as any).getInitializer();
          if (initializer) {
            initializer.getElements().forEach((element: any) => {
              const depName = element.getText();
              const sanitizedDep = sanitizeDependency(depName);
              if (sanitizedDep) dependencies.push(sanitizedDep);
            });
          }
        }
      },
    );
  }

  return dependencies;
}

function generateUML(projectPath: string, outputFilePath: string) {
  const project = new Project();
  project.addSourceFilesAtPaths(`${projectPath}/**/*.ts`);

  const modules = [];
  const plantUML: string[] = [
    '@startuml',
    'top to bottom direction',
    'skinparam classAttributeIconSize 10',
    'skinparam linetype ortho',
  ];

  for (const sourceFile of project.getSourceFiles()) {
    for (const cls of sourceFile.getClasses()) {
      const className = cls.getName();
      const decorators = getDecorators(cls.getDecorators());

      if (!className || !decorators.length) continue;

      const { attributes, methods } = extractClassDetails(cls);

      plantUML.push(`class ${className} {`);

      for (const attr of attributes) {
        plantUML.push(`  + ${attr.name}: ${attr.type}`);
      }

      for (const method of methods) {
        const params = method.parameters
          //.map((param) => `${param.name}: ${param.type}`)
          .map((param) => `${param.name}`)
          .join(', ');
        //plantUML.push(`  + ${method.name}(${params}): ${method.returnType}`);
        plantUML.push(`  + ${method.name}(${params})`);
      }

      if (className.match('Module')) {
        plantUML.push('  + init(): self');
      }

      plantUML.push('}');

      if (decorators.includes('Module')) {
        const dependencies = extractModuleDependencies(
          cls.getDecorator('Module')!,
        );
        modules.push({ name: className, dependencies });
      }
    }
  }

  for (const mod of modules) {
    for (const dep of mod.dependencies) {
      plantUML.push(`${mod.name} --> ${dep}`);
    }
  }

  plantUML.push('@enduml');

  fs.writeFileSync(outputFilePath, plantUML.join('\n'));
  console.log(`Saved to ${outputFilePath}`);
}


generateUML('../src', 'diagram.puml');
