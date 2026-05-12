# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetAllQuestions*](#getallquestions)
- [**Mutations**](#mutations)
  - [*CreateNewUser*](#createnewuser)
  - [*UpdateStudentApplicationStatus*](#updatestudentapplicationstatus)
  - [*DeleteAssessmentResult*](#deleteassessmentresult)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetAllQuestions
You can execute the `GetAllQuestions` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getAllQuestions(options?: ExecuteQueryOptions): QueryPromise<GetAllQuestionsData, undefined>;

interface GetAllQuestionsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAllQuestionsData, undefined>;
}
export const getAllQuestionsRef: GetAllQuestionsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAllQuestions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetAllQuestionsData, undefined>;

interface GetAllQuestionsRef {
  ...
  (dc: DataConnect): QueryRef<GetAllQuestionsData, undefined>;
}
export const getAllQuestionsRef: GetAllQuestionsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAllQuestionsRef:
```typescript
const name = getAllQuestionsRef.operationName;
console.log(name);
```

### Variables
The `GetAllQuestions` query has no variables.
### Return Type
Recall that executing the `GetAllQuestions` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAllQuestionsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetAllQuestionsData {
  questions: ({
    id: UUIDString;
    questionText: string;
    questionType: string;
    options?: string | null;
    correctAnswer?: string | null;
    createdAt: TimestampString;
  } & Question_Key)[];
}
```
### Using `GetAllQuestions`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAllQuestions } from '@dataconnect/generated';


// Call the `getAllQuestions()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAllQuestions();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAllQuestions(dataConnect);

console.log(data.questions);

// Or, you can use the `Promise` API.
getAllQuestions().then((response) => {
  const data = response.data;
  console.log(data.questions);
});
```

### Using `GetAllQuestions`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAllQuestionsRef } from '@dataconnect/generated';


// Call the `getAllQuestionsRef()` function to get a reference to the query.
const ref = getAllQuestionsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAllQuestionsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.questions);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.questions);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewUser
You can execute the `CreateNewUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewUser(vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface CreateNewUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
}
export const createNewUserRef: CreateNewUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewUser(dc: DataConnect, vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface CreateNewUserRef {
  ...
  (dc: DataConnect, vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
}
export const createNewUserRef: CreateNewUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewUserRef:
```typescript
const name = createNewUserRef.operationName;
console.log(name);
```

### Variables
The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewUserVariables {
  username: string;
  passwordHash: string;
  role: string;
  email?: string | null;
}
```
### Return Type
Recall that executing the `CreateNewUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewUserData {
  user_insert: User_Key;
}
```
### Using `CreateNewUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewUser, CreateNewUserVariables } from '@dataconnect/generated';

// The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`:
const createNewUserVars: CreateNewUserVariables = {
  username: ..., 
  passwordHash: ..., 
  role: ..., 
  email: ..., // optional
};

// Call the `createNewUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewUser(createNewUserVars);
// Variables can be defined inline as well.
const { data } = await createNewUser({ username: ..., passwordHash: ..., role: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewUser(dataConnect, createNewUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createNewUser(createNewUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateNewUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewUserRef, CreateNewUserVariables } from '@dataconnect/generated';

// The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`:
const createNewUserVars: CreateNewUserVariables = {
  username: ..., 
  passwordHash: ..., 
  role: ..., 
  email: ..., // optional
};

// Call the `createNewUserRef()` function to get a reference to the mutation.
const ref = createNewUserRef(createNewUserVars);
// Variables can be defined inline as well.
const ref = createNewUserRef({ username: ..., passwordHash: ..., role: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewUserRef(dataConnect, createNewUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateStudentApplicationStatus
You can execute the `UpdateStudentApplicationStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateStudentApplicationStatus(vars: UpdateStudentApplicationStatusVariables): MutationPromise<UpdateStudentApplicationStatusData, UpdateStudentApplicationStatusVariables>;

interface UpdateStudentApplicationStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateStudentApplicationStatusVariables): MutationRef<UpdateStudentApplicationStatusData, UpdateStudentApplicationStatusVariables>;
}
export const updateStudentApplicationStatusRef: UpdateStudentApplicationStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateStudentApplicationStatus(dc: DataConnect, vars: UpdateStudentApplicationStatusVariables): MutationPromise<UpdateStudentApplicationStatusData, UpdateStudentApplicationStatusVariables>;

interface UpdateStudentApplicationStatusRef {
  ...
  (dc: DataConnect, vars: UpdateStudentApplicationStatusVariables): MutationRef<UpdateStudentApplicationStatusData, UpdateStudentApplicationStatusVariables>;
}
export const updateStudentApplicationStatusRef: UpdateStudentApplicationStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateStudentApplicationStatusRef:
```typescript
const name = updateStudentApplicationStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateStudentApplicationStatus` mutation requires an argument of type `UpdateStudentApplicationStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateStudentApplicationStatusVariables {
  applicationId: UUIDString;
  newStatus: string;
}
```
### Return Type
Recall that executing the `UpdateStudentApplicationStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateStudentApplicationStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateStudentApplicationStatusData {
  studentApplication_update?: StudentApplication_Key | null;
}
```
### Using `UpdateStudentApplicationStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateStudentApplicationStatus, UpdateStudentApplicationStatusVariables } from '@dataconnect/generated';

// The `UpdateStudentApplicationStatus` mutation requires an argument of type `UpdateStudentApplicationStatusVariables`:
const updateStudentApplicationStatusVars: UpdateStudentApplicationStatusVariables = {
  applicationId: ..., 
  newStatus: ..., 
};

// Call the `updateStudentApplicationStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateStudentApplicationStatus(updateStudentApplicationStatusVars);
// Variables can be defined inline as well.
const { data } = await updateStudentApplicationStatus({ applicationId: ..., newStatus: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateStudentApplicationStatus(dataConnect, updateStudentApplicationStatusVars);

console.log(data.studentApplication_update);

// Or, you can use the `Promise` API.
updateStudentApplicationStatus(updateStudentApplicationStatusVars).then((response) => {
  const data = response.data;
  console.log(data.studentApplication_update);
});
```

### Using `UpdateStudentApplicationStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateStudentApplicationStatusRef, UpdateStudentApplicationStatusVariables } from '@dataconnect/generated';

// The `UpdateStudentApplicationStatus` mutation requires an argument of type `UpdateStudentApplicationStatusVariables`:
const updateStudentApplicationStatusVars: UpdateStudentApplicationStatusVariables = {
  applicationId: ..., 
  newStatus: ..., 
};

// Call the `updateStudentApplicationStatusRef()` function to get a reference to the mutation.
const ref = updateStudentApplicationStatusRef(updateStudentApplicationStatusVars);
// Variables can be defined inline as well.
const ref = updateStudentApplicationStatusRef({ applicationId: ..., newStatus: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateStudentApplicationStatusRef(dataConnect, updateStudentApplicationStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.studentApplication_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.studentApplication_update);
});
```

## DeleteAssessmentResult
You can execute the `DeleteAssessmentResult` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteAssessmentResult(vars: DeleteAssessmentResultVariables): MutationPromise<DeleteAssessmentResultData, DeleteAssessmentResultVariables>;

interface DeleteAssessmentResultRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAssessmentResultVariables): MutationRef<DeleteAssessmentResultData, DeleteAssessmentResultVariables>;
}
export const deleteAssessmentResultRef: DeleteAssessmentResultRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteAssessmentResult(dc: DataConnect, vars: DeleteAssessmentResultVariables): MutationPromise<DeleteAssessmentResultData, DeleteAssessmentResultVariables>;

interface DeleteAssessmentResultRef {
  ...
  (dc: DataConnect, vars: DeleteAssessmentResultVariables): MutationRef<DeleteAssessmentResultData, DeleteAssessmentResultVariables>;
}
export const deleteAssessmentResultRef: DeleteAssessmentResultRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteAssessmentResultRef:
```typescript
const name = deleteAssessmentResultRef.operationName;
console.log(name);
```

### Variables
The `DeleteAssessmentResult` mutation requires an argument of type `DeleteAssessmentResultVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteAssessmentResultVariables {
  assessmentId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteAssessmentResult` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteAssessmentResultData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteAssessmentResultData {
  assessmentResult_delete?: AssessmentResult_Key | null;
}
```
### Using `DeleteAssessmentResult`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteAssessmentResult, DeleteAssessmentResultVariables } from '@dataconnect/generated';

// The `DeleteAssessmentResult` mutation requires an argument of type `DeleteAssessmentResultVariables`:
const deleteAssessmentResultVars: DeleteAssessmentResultVariables = {
  assessmentId: ..., 
};

// Call the `deleteAssessmentResult()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteAssessmentResult(deleteAssessmentResultVars);
// Variables can be defined inline as well.
const { data } = await deleteAssessmentResult({ assessmentId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteAssessmentResult(dataConnect, deleteAssessmentResultVars);

console.log(data.assessmentResult_delete);

// Or, you can use the `Promise` API.
deleteAssessmentResult(deleteAssessmentResultVars).then((response) => {
  const data = response.data;
  console.log(data.assessmentResult_delete);
});
```

### Using `DeleteAssessmentResult`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteAssessmentResultRef, DeleteAssessmentResultVariables } from '@dataconnect/generated';

// The `DeleteAssessmentResult` mutation requires an argument of type `DeleteAssessmentResultVariables`:
const deleteAssessmentResultVars: DeleteAssessmentResultVariables = {
  assessmentId: ..., 
};

// Call the `deleteAssessmentResultRef()` function to get a reference to the mutation.
const ref = deleteAssessmentResultRef(deleteAssessmentResultVars);
// Variables can be defined inline as well.
const ref = deleteAssessmentResultRef({ assessmentId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteAssessmentResultRef(dataConnect, deleteAssessmentResultVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.assessmentResult_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.assessmentResult_delete);
});
```

