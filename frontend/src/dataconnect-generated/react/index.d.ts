import { CreateNewUserData, CreateNewUserVariables, GetAllQuestionsData, UpdateStudentApplicationStatusData, UpdateStudentApplicationStatusVariables, DeleteAssessmentResultData, DeleteAssessmentResultVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateNewUser(options?: useDataConnectMutationOptions<CreateNewUserData, FirebaseError, CreateNewUserVariables>): UseDataConnectMutationResult<CreateNewUserData, CreateNewUserVariables>;
export function useCreateNewUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateNewUserData, FirebaseError, CreateNewUserVariables>): UseDataConnectMutationResult<CreateNewUserData, CreateNewUserVariables>;

export function useGetAllQuestions(options?: useDataConnectQueryOptions<GetAllQuestionsData>): UseDataConnectQueryResult<GetAllQuestionsData, undefined>;
export function useGetAllQuestions(dc: DataConnect, options?: useDataConnectQueryOptions<GetAllQuestionsData>): UseDataConnectQueryResult<GetAllQuestionsData, undefined>;

export function useUpdateStudentApplicationStatus(options?: useDataConnectMutationOptions<UpdateStudentApplicationStatusData, FirebaseError, UpdateStudentApplicationStatusVariables>): UseDataConnectMutationResult<UpdateStudentApplicationStatusData, UpdateStudentApplicationStatusVariables>;
export function useUpdateStudentApplicationStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateStudentApplicationStatusData, FirebaseError, UpdateStudentApplicationStatusVariables>): UseDataConnectMutationResult<UpdateStudentApplicationStatusData, UpdateStudentApplicationStatusVariables>;

export function useDeleteAssessmentResult(options?: useDataConnectMutationOptions<DeleteAssessmentResultData, FirebaseError, DeleteAssessmentResultVariables>): UseDataConnectMutationResult<DeleteAssessmentResultData, DeleteAssessmentResultVariables>;
export function useDeleteAssessmentResult(dc: DataConnect, options?: useDataConnectMutationOptions<DeleteAssessmentResultData, FirebaseError, DeleteAssessmentResultVariables>): UseDataConnectMutationResult<DeleteAssessmentResultData, DeleteAssessmentResultVariables>;
