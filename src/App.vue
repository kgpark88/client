<template>
  <v-app class="app" >  
    <v-main>
      <div id="core-view">
        <div class="page-wrapper">
          <v-fade-transition mode="out-in">
            <router-view></router-view>
          </v-fade-transition>
        </div>   
        <Footer></Footer>
      </div>
    </v-main>
  </v-app>
</template>  


<script>
export default {
  name: 'App',
};
</script>