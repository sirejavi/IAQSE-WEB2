ToastEventBus = new Vue(); // declare then global event bus
ToastService = {
 install: function install(Vue) { //modify the object of $emit, use above event bus
   Vue.prototype.$toast = {
     add: function add(message) {
   	  ToastEventBus.$emit('add', message);
     },
     removeGroup: function removeGroup(group) {
   	  ToastEventBus.$emit('remove-group', group);
     },
     removeAllGroups: function removeAllGroups() {
   	  ToastEventBus.$emit('remove-all-groups');
     }
   };
 }
};