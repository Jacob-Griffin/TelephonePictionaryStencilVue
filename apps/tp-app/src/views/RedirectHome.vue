<script>
export default {
  beforeMount() {
    // If we got here, we're on an invalid route. Silently redirect to home
    location.href = '/';
    return;
  },
};
</script>
