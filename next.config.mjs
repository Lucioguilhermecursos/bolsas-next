/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Build enxuto para container (`node server.js`). Só ligado quando
     BUILD_STANDALONE está setado — o Dockerfile seta. Fora disso o build é o
     normal, para `next start` continuar funcionando (é o que a suíte de
     testes usa; `next start` não roda com output "standalone"). */
  ...(process.env.BUILD_STANDALONE ? { output: "standalone" } : {}),
};

export default nextConfig;
