var ptoast = {
    el: "#toast",
    mounted(){
        var _this = this.$refs.toast_message;
        ToastEventBus.$on('add', function (message) {
          if (_this.group == message.group) {
            _this.add(message);
          }
        });
        
        ToastEventBus.$on('remove-group', function (group) {
          if (_this.group === group) {
            _this.messages = [];
          }
        });
        
        ToastEventBus.$on('remove-all-groups', function () {
          _this.messages = [];
        });
    },
    components: {
    	'ts-toast' : toast
    },
    
    template: `
    		<ts-toast ref='toast_message'></ts-toast>
    	`
};