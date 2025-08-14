import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { provideApollo } from "./apollo";
import './style.css'


const app = createApp(App);

provideApollo(app);

app.use(router).mount("#app");
