import { parseCurl } from './demoforge/src/lib/curlParser';

const testCurl = `curl --location 'https://kecno67xmqjfdu7dump5asz4ai.apigateway.ap-mumbai-1.oci.customer-oci.com/polycab/loyalty/v2/loyalty/getSsoToken?redemptionType=GIFT&language=EN&env=PROD&redirectionParameter=REDEEM' \\
--header 'api_sec_token: muR4wv1VUCcHQlmMeBe1EIOzXrBmSoC//8JeKW2bGiE=$9b6b905b3e442e3661d36cfc$e46d8ee79df65fb89284d52fe2004121$KIIkWjRAWLUjvuxoyHkQ4AnYo7eofLvpiBxKU1M=' \\
--header 'encryption_disabled: Y' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjdXN0b21lciIsImN1c3RvbWVySWQiOjE1MDQsIm1vYmlsZSI6IjkxOTc3MzcyMzgzNiIsInVzZXJUeXBlIjoicmV0YWlsZXIiLCJzdWJVc2VySWQiOi0xLCJpYXQiOjE3NzQ0MTcyNDEsImV4cCI6MTc3NTAyMjA0MX0.fVFBNCvwdBjpHx9m17a04kAT4o3RkW170tI37L6bUpLCZnRZnLn1cGxn9mxvScIQ3MpyIbALo0RjnqRjBczbNDQTmiHdkEfKLr1GKz508tdlHE_EiJEFhyySU8hunklMK0qRvrZeCpcHPTyer_tyzsw9FekfcYRtDic0cWxBn_qB-fLPwRt21E4PYPt1xaYEak-G5yxE8S2oqYVHS82BfuZAaiu9QIJ09TLrskdtazvf0nBfdFvKECNtNQh1zXu9DHNQV4XCgatQk0a2WymTnGCbCivvJlWW2GDkEBOE8wcNQ2JyWCcXRvMCD1d4_dyWIXnXCuhUqS_b4TacH846Zg' \\
--data ''`;

const parsed = parseCurl(testCurl);
console.log('Parsed Result:', JSON.stringify(parsed, null, 2));
