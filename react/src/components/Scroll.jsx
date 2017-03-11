import React from 'react'

import './Scroll.scss'

/* usage:
    <Scroll 
      mainBoxID='UserListBox' 
      contentID='UserList' 
      scrollBackgroundStyle='defaultScrollBackground' 
      scrollStyle='defaultScroll'
      scrollUpdate={list.length}
    />
*/
export default class Scroll extends React.Component {
  
  constructor(props) {
    super(props);
    this.wheelData = 0;
    this.state = {
      scrollDynamicStyle: {height: "0"},
    };
    this.resizeHandler = () => {
      this.updateScroll();
    }
  }
  
  static get defaultProps() {
    return {
      scrollBackgroundStyle: "defaultScrollBackground",
      scrollStyle: "defaultScroll"
    };
  }

  bind(node, type, handler){
    if(node.addEventListener){
      node.addEventListener(type, handler, false);
    }else if(node.attachEvent){
      node.attachEvent('on' + type,handler);
    }else{
      node['on'+type] = handler;
    }
  }

  mouseWheel(node, handler) {
    this.bind(node, 'mousewheel', function(event){
      var data = -getWheelData(event);
      handler(data);
      if(document.all){
        window.event.returnValue = false;
      }else{
        event.preventDefault();
      }
    });
    // firefox
    this.bind(node, 'DOMMouseScroll', function(event){
      var data = getWheelData(event);
      handler(data);
      event.preventDefault();
    });
    function getWheelData(event){
      var e = event || window.event;
      return e.wheelDelta ? e.wheelDelta : e.detail*40;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (typeof(nextProps.scrollUpdate)!=="undefined") {
      this.updateScroll();
    }
  }

  updateScroll() {
    var contentHeight = document.getElementById(this.props.contentID).offsetHeight;
    var clientHeight = document.getElementById(this.props.mainBoxID).offsetHeight;
    var scrollHeight = parseInt(clientHeight * (clientHeight / contentHeight));
    var height = scrollHeight>=clientHeight?clientHeight+'px':scrollHeight+'px';
    this.setState({
      scrollDynamicStyle: {
        height: height,
      }
    })
  }
  
  tragScroll(mainBox, content, scroll) {
    var mainHeight = mainBox.clientHeight;
    scroll.onmousedown = (event) => {
      var scrollTop = scroll.offsetTop;
      var e = event || window.event;
      var oldTop = e.clientY;
      document.onmousemove = (event) => {
        var e = event || window.event;
        var newTop = e.clientY;
        newTop = scrollTop + newTop - oldTop;
        if (newTop > mainHeight - scroll.offsetHeight){
          newTop = mainHeight - scroll.offsetHeight;
        }
        if(newTop <= 0){
          newTop = 0;
        }
        scroll.style.top = newTop + "px";
        content.style.top = -newTop * (content.offsetHeight / mainBox.offsetHeight) + "px";
        this.wheelData = newTop;
      }
      document.onmouseup = (event) => {
        document.onmousemove=null;
      }
    }
  }

  wheelChange(mainBox, content, scroll){
    var flag = 0, rate = 0, wheelFlag = 0;
    this.mouseWheel(mainBox, (data) => {
      wheelFlag += data;
      if(this.wheelData >= 0){
        flag = this.wheelData;
        scroll.style.top = flag + "px";
        wheelFlag = this.wheelData * 12;
        this.wheelData = -1;
      }else{
        flag = wheelFlag / 12;
      }
      if(flag <= 0){
        flag = 0;
        wheelFlag = 0;
      }
      if(flag >= mainBox.offsetHeight - scroll.offsetHeight){
        flag = mainBox.clientHeight - scroll.offsetHeight;
        wheelFlag = (mainBox.clientHeight - scroll.offsetHeight) * 12;
      }
      scroll.style.top = flag + "px";
      content.style.top = -flag * (content.offsetHeight / mainBox.offsetHeight) + "px";
    });
  }

  componentDidMount() {
    var mainBox = document.getElementById(this.props.mainBoxID);
    var content = document.getElementById(this.props.contentID);
    var scroll = document.getElementById(this.props.mainBoxID+'-scroll');
    this.updateScroll();
    this.tragScroll(mainBox, content, scroll);
    this.wheelChange(mainBox, content, scroll);
    window.addEventListener("resize", this.resizeHandler);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeHandler);
  }

  render() {
    return (
      <div className={this.props.scrollBackgroundStyle}>
        <div className={this.props.scrollStyle} id={this.props.mainBoxID+'-scroll'} style={this.state.scrollDynamicStyle}>
        </div>
      </div>
    )
  }
}