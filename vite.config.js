import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vite.dev/config/
export default defineConfig(({mode})=>{
  const envDir=path.resolve(__dirname,'env');
  const env=loadEnv(mode, envDir,'');
  return{
    plugins: [react()],
    envDir,
    define:{
      'process.env':env
    }
  }
  
})

// import { defineConfig, loadEnv } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => {
//   // Define custom path to the env folder
//   const envDir = path.resolve(__dirname, 'env');

//   // Load environment variables from the appropriate .env file based on mode
//   const env = loadEnv(mode, envDir);

//   return {
//     plugins: [react()],
//     envDir,
//     define: {
//       // Expose environment variables to import.meta.env
//       'import.meta.env': {
//         ...Object.entries(env).reduce((prev, [key, val]) => {
//           prev[key] = JSON.stringify(val);
//           return prev;
//         }, {})
//       }
//     }
//   };
// });

