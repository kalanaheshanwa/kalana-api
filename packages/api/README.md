Login with cli client

```sh
aws cognito-idp initiate-auth --region us-east-1 --auth-flow USER_PASSWORD_AUTH --client-id 6ch441oc778feoe2uae71k2n9k --auth-parameters USERNAME=achinthamadumal@gmail.com,PASSWORD=<password>
```

Generate AWS Aurora DSQL token for non admin user
https://docs.aws.amazon.com/aurora-dsql/latest/userguide/SECTION_authentication-token.html#authentication-token-sdks

```sh
aws dsql generate-db-connect-auth-token --hostname=mbti7hgg7am3rzqp4jxvmfuxty.dsql.us-east-1.on.aws --region=us-east-1 --expires-in=3600 --profile kalanah-dev
```
