# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createNewUser, getAllQuestions, updateStudentApplicationStatus, deleteAssessmentResult } from '@dataconnect/generated';


// Operation CreateNewUser:  For variables, look at type CreateNewUserVars in ../index.d.ts
const { data } = await CreateNewUser(dataConnect, createNewUserVars);

// Operation GetAllQuestions: 
const { data } = await GetAllQuestions(dataConnect);

// Operation UpdateStudentApplicationStatus:  For variables, look at type UpdateStudentApplicationStatusVars in ../index.d.ts
const { data } = await UpdateStudentApplicationStatus(dataConnect, updateStudentApplicationStatusVars);

// Operation DeleteAssessmentResult:  For variables, look at type DeleteAssessmentResultVars in ../index.d.ts
const { data } = await DeleteAssessmentResult(dataConnect, deleteAssessmentResultVars);


```