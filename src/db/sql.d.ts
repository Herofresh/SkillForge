/** `.sql` migration files are inlined as strings by babel-plugin-inline-import (ADR-026). */
declare module '*.sql' {
  const content: string;
  export default content;
}
