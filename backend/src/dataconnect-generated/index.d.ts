import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AssessmentResult_Key {
  id: UUIDString;
  __typename?: 'AssessmentResult_Key';
}

export interface CreateNewUserData {
  user_insert: User_Key;
}

export interface CreateNewUserVariables {
  username: string;
  passwordHash: string;
  role: string;
  email?: string | null;
}

export interface DeleteAssessmentResultData {
  assessmentResult_delete?: AssessmentResult_Key | null;
}

export interface DeleteAssessmentResultVariables {
  assessmentId: UUIDString;
}

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

export interface Qualification_Key {
  id: UUIDString;
  __typename?: 'Qualification_Key';
}

export interface Question_Key {
  id: UUIDString;
  __typename?: 'Question_Key';
}

export interface StudentApplication_Key {
  id: UUIDString;
  __typename?: 'StudentApplication_Key';
}

export interface UpdateStudentApplicationStatusData {
  studentApplication_update?: StudentApplication_Key | null;
}

export interface UpdateStudentApplicationStatusVariables {
  applicationId: UUIDString;
  newStatus: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
  operationName: string;
}
export const createNewUserRef: CreateNewUserRef;

export function createNewUser(vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;
export function createNewUser(dc: DataConnect, vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface GetAllQuestionsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetAllQuestionsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetAllQuestionsData, undefined>;
  operationName: string;
}
export const getAllQuestionsRef: GetAllQuestionsRef;

export function getAllQuestions(options?: ExecuteQueryOptions): QueryPromise<GetAllQuestionsData, undefined>;
export function getAllQuestions(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetAllQuestionsData, undefined>;

interface UpdateStudentApplicationStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateStudentApplicationStatusVariables): MutationRef<UpdateStudentApplicationStatusData, UpdateStudentApplicationStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateStudentApplicationStatusVariables): MutationRef<UpdateStudentApplicationStatusData, UpdateStudentApplicationStatusVariables>;
  operationName: string;
}
export const updateStudentApplicationStatusRef: UpdateStudentApplicationStatusRef;

export function updateStudentApplicationStatus(vars: UpdateStudentApplicationStatusVariables): MutationPromise<UpdateStudentApplicationStatusData, UpdateStudentApplicationStatusVariables>;
export function updateStudentApplicationStatus(dc: DataConnect, vars: UpdateStudentApplicationStatusVariables): MutationPromise<UpdateStudentApplicationStatusData, UpdateStudentApplicationStatusVariables>;

interface DeleteAssessmentResultRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAssessmentResultVariables): MutationRef<DeleteAssessmentResultData, DeleteAssessmentResultVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteAssessmentResultVariables): MutationRef<DeleteAssessmentResultData, DeleteAssessmentResultVariables>;
  operationName: string;
}
export const deleteAssessmentResultRef: DeleteAssessmentResultRef;

export function deleteAssessmentResult(vars: DeleteAssessmentResultVariables): MutationPromise<DeleteAssessmentResultData, DeleteAssessmentResultVariables>;
export function deleteAssessmentResult(dc: DataConnect, vars: DeleteAssessmentResultVariables): MutationPromise<DeleteAssessmentResultData, DeleteAssessmentResultVariables>;

