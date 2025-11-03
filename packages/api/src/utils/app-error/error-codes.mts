export enum AppErrorCode {
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ATTEMPT_FAILED = 'VALIDATION_ATTEMPT_FAILED',
  FORBIDDEN = 'FORBIDDEN',
  BAD_USER_INPUT = 'BAD_USER_INPUT',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  BAD_REQUEST = 'BAD_REQUEST',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  CONFLICT = 'CONFLICT',
  TIMEOUT = 'TIMEOUT',
  OPERATION_NOT_PERMITTED = 'OPERATION_NOT_PERMITTED',
  VERIFICATION_FAILED = 'VERIFICATION_FAILED',
}

export const ERROR_CODE_INFO: Record<AppErrorCode, { id: string; description: string }> = {
  UNAUTHORIZED: {
    id: '1001',
    description: 'Authentication has failed.',
  },
  FORBIDDEN: {
    id: '1002',
    description: 'You do not have the necessary permissions to perform the requested operation.',
  },
  BAD_USER_INPUT: {
    id: '1003',
    description: 'One or more input parameters are invalid.',
  },
  NOT_FOUND: {
    id: '1004',
    description: 'Could not find what you are looking for.',
  },
  RESOURCE_NOT_FOUND: {
    id: '1005',
    description: 'The requested resource does not exist.',
  },
  INTERNAL_SERVER_ERROR: {
    id: '1006',
    description: 'A server side error occurred. Our team will look into this ASAP.',
  },
  DUPLICATE_ENTRY: {
    id: '1007',
    description: 'The data already exists.',
  },
  BAD_REQUEST: {
    id: '1008',
    description: 'The request cannot be processed due to invalid request.',
  },
  LIMIT_EXCEEDED: {
    id: '1009',
    description: 'Maximum limit has reached already.',
  },
  UNSUPPORTED_OPERATION: {
    id: '1010',
    description: 'The operation being attempted is not supported.',
  },
  SERVICE_UNAVAILABLE: {
    id: '1011',
    description: 'The service is temporarily unavailable.',
  },
  CONFLICT: {
    id: '1012',
    description: 'The request could not be completed due to a conflict with the current state of the resource.',
  },
  TIMEOUT: {
    id: '1013',
    description: 'Time limit given to perform this action has exceeded. Please try again.',
  },
  VALIDATION_ATTEMPT_FAILED: {
    id: '1014',
    description: 'Validation attempt failed. Please try again if you have left more attempts.',
  },
  OPERATION_NOT_PERMITTED: {
    id: '1015',
    description: 'This operation cannot be permitted due to the current state of the resource.',
  },
  VERIFICATION_FAILED: {
    id: '1016',
    description: 'We could not verify the details. Make sure the provided details are correct.',
  },
};
