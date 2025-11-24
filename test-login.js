import { asymmetricEncrypt } from "./utile/encrption/encrption.utile.js";
import { loginUser } from "./src/modules/auth/auth.service.js";

const run = async () => {
  const email = "test@example.com";
  const password = "12345";

  const storedUser = {
    email: asymmetricEncrypt(email),
    password: asymmetricEncrypt(password),
    id: "fake-id-1",
  };

  const result = await loginUser(email, password, storedUser);
  console.log(result);
};

run();
