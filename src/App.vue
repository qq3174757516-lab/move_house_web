<template>
  <div id='app'>
    <router-view />
  </div>
</template>

<script>
export default {
  created() {
    window.addEventListener('beforeunload', () => {
      localStorage.setItem('temp_state', JSON.stringify(this.$store.state))
    })
    this.$store.replaceState(Object.assign(this.$store.state, JSON.parse(localStorage.getItem('temp_state'))))
  }
}
</script>

<style lang='scss'>
#app, body, html {
  width: 100vw;
  height: 100vh;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>
