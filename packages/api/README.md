Login with cli client

```sh
aws cognito-idp initiate-auth --region ap-southeast-1 --auth-flow USER_PASSWORD_AUTH --client-id <clientid> --auth-parameters USERNAME=<email>,PASSWORD=<password>
```
