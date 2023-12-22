import MemberService from '@/services/MemberService';
import { createStore } from 'vuex';

const store = createStore({
  state: {
    userInfo: null,
  },
  mutations: {
    setUserInfo(state, userInfo) {
      state.userInfo = userInfo;
    },
  },
  // getters: {
  //   userRole: (state) => state.userInfo.role,
  // },
  actions: {
    fetchUserInfo({ commit }) {
      // Make API call to fetch user info
      // For example, using axios:
      // axios.get('/api/user').then(response => {
      //   commit('setUserInfo', response.data);
      // });
      // Replace the above with your actual API call

      // For demo purposes, let's simulate a response
      MemberService.getMemberInfo().then(( { success, message, data } ) => {
        if (!success) {
            console.log(message);
        }
        commit('setUserInfo', data);
      });
    },
  },
});

export default store;