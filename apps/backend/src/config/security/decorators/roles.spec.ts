import { Roles, ROLES_KEY } from './roles';

describe('Roles Decorator', () => {
  it('should set roles metadata on a class', () => {
    @Roles('ADMIN', 'JURY')
    class TestClass {}
    const roles = Reflect.getMetadata(ROLES_KEY, TestClass);

    expect(roles).toEqual(['ADMIN', 'JURY']);
  });

  it('should set roles metadata on a method', () => {
    class TestClass {
      @Roles('ADMIN')
      testMethod() {
        /* empty */
      }
    }

    const roles = Reflect.getMetadata(
      ROLES_KEY,
      TestClass.prototype.testMethod,
    );

    expect(roles).toEqual(['ADMIN']);
  });
});
