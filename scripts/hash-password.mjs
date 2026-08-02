import {pbkdf2Sync,randomBytes} from 'node:crypto';
const password=process.argv[2];if(!password){console.error('用法: npm run hash-password -- "家庭口令"');process.exit(1)}
const b=v=>Buffer.from(v).toString('base64url'),rounds=100000,salt=randomBytes(16);console.log(`pbkdf2-sha256$${rounds}$${b(salt)}$${b(pbkdf2Sync(password,salt,rounds,32,'sha256'))}`);
