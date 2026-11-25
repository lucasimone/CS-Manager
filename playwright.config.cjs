const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'./tests/browser',
 testMatch:'**/*.spec.cjs',
 timeout:60000,
 workers:1,
 reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL:'http://127.0.0.1:8000',browserName:'chromium',viewport:{width:1440,height:900},trace:'retain-on-failure',screenshot:'only-on-failure'},
 webServer:{command:'python3 -m http.server 8000 --bind 127.0.0.1',url:'http://127.0.0.1:8000',reuseExistingServer:false}
});