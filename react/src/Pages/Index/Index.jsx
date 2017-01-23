import React from 'react';
import GameTab from './GameTab/GameTab';
import UserTab from './UserTab/UserTab';
import ws from '../../utils/websocket';
import MaskLayer from './MaskLayer/MaskLayer';
import { connect } from 'react-redux'
import actions from '../../actions/actions'

class Index extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    ws.createWS();
  }

  render() {
    return (
      <div >
        <MaskLayer mask={this.props.mask} setMask={this.props.setMask} />
        <Header />
        <Account />
        <GameTab />
        <UserTab />
        <Footer />
      </div>
    );
  }
}

// 哪些 Redux 全局的 state 是我们组件想要通过 props 获取的？
function mapStateToProps(state) {
  return {
    mask: state.mask
  }
}

// 哪些 action 创建函数是我们想要通过 props 获取的？
function mapDispatchToProps(dispatch) {
  return actions
}

// 将state的指定值映射在props上，将action的所有方法映射在props上
export default connect(mapStateToProps, actions)(Index);

class Header extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
  return (
      <div style={{background: '#3c3c3c', color: '#ffffff', height: '32px', width: '100%',position: 'fixed', top: '0', left: '0'}}>
        <img src="/img/logo.png"/>
        <span>NES Online</span>
      </div>
    )
  }
}

class Footer extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
        <div height="32px" style={{background: '#3c3c3c', width: '100%', position: 'fixed', bottom: '0', left: '0'}}>
          <a style={{float: "right"}} target="blank" href="https://github.com/MeteorKL">
            <img src="/img/github.png"/>
          </a>
        </div>
      )
    }
}

class Account extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
        <div style={{background: '#3c3c3c', height: '32px', width: '100%', position: 'fixed', top: '32px', left: '0'}}>
            <span style={{float: "right"}}>
              <img style={{height: '32px', width: '32px'}}src="/img/avatar/questionMark.jpg"/>
              <span style={{color: '#ffffff', fontSize: '8px'}}>MeteorKL</span>
            </span>
        </div>
      )
    }
}