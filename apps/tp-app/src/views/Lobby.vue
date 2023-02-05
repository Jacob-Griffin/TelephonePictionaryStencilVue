<script>
export default {
  data() {
    return {
      players: [],
    };
  },
  methods:{
    handleNewPlayer({detail}){
      this.players = detail;
    }
  }
};
</script>
