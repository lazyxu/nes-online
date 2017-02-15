//reducer就是个function,名字随便你起，功能就是在action触发后，返回一个新的state(就是个对象)
export default function set(state, action){
  switch(action.type){
    case 'setGame':
      return{
        gameTab: state.gameTab,
        game: action.game,
        room: state.room,
        user: state.user,
        nes: state.nes
      };
    case 'setUser':
      return{
        gameTab: state.gameTab,
        game: state.game,
        room: state.room,
        user: action.user,
        nes: state.nes
      };
    case 'setGameTab':
      return{
        gameTab: action.gameTab,
        game: state.game,
        room: state.room,
        user: state.user,
        nes: state.nes
      };
    case 'setNES':
      return{
        gameTab: state.gameTab,
        game: state.game,
        room: state.room,
        user: state.user,
        nes: action.nes
      };
    case 'setRoom':
      return{
        gameTab: state.gameTab,
        game: state.game,
        room: action.room,
        user: state.user,
        nes: state.nes
      };
    default:
      return {
        user: {
          name: '未登录',
          avatar: '/img/avatar/questionMark.jpg'
        },
        gameTab: 'GameList',
        game: '',
        room: null,
        nes: null
      };
  }
}