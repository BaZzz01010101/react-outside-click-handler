import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon-sandbox';
import { shallow, mount } from 'enzyme';
import wrap from 'mocha-wrap';
import contains from 'document.contains';

import OutsideClickHandler from '../src/OutsideClickHandler';

describe('OutsideClickHandler', () => {
  describe('basics', () => {
    it('renders a div', () => {
      expect(shallow(<OutsideClickHandler />).is('div')).to.equal(true);
    });

    it('renders the children it‘s given', () => {
      const wrapper = shallow((
        <OutsideClickHandler>
          <section id="a" />
          <nav id="b" />
        </OutsideClickHandler>
      ));
      expect(wrapper.children().map(x => ({ type: x.type(), id: x.prop('id') }))).to.eql([
        { type: 'section', id: 'a' },
        { type: 'nav', id: 'b' },
      ]);
    });
  });

  describe('#onOutsideClick()', () => {
    const target = { parentNode: null };
    const event = { target };
    beforeEach(() => {
      target.parentNode = null;
    });

    it('is a noop if `this.childNode` contains `e.target`', () => {
      const spy = sinon.spy();
      const wrapper = shallow(<OutsideClickHandler onOutsideClick={spy} />);
      const instance = wrapper.instance();

      instance.childNode = {};
      instance._isMounted = true;
      target.parentNode = instance.childNode;
      expect(contains(instance.childNode, target)).to.equal(true);

      instance.onMouseUp(event);

      expect(spy).to.have.property('callCount', 0);
    });

    it('is a noop if `this._isMounted` is `false`', () => {
      const spy = sinon.spy();
      const wrapper = shallow(<OutsideClickHandler onOutsideClick={spy} />);
      const instance = wrapper.instance();

      instance.childNode = {};
      instance._isMounted = false;
      expect(contains(instance.childNode, target)).to.equal(false);

      instance.onMouseUp(event);

      expect(spy).to.have.property('callCount', 0);
    });

    describe('when `this.childNode` does not contain `e.target` and `this._isMounted` is `true`', () => {
      it('calls onOutsideClick', () => {
        const spy = sinon.spy();
        const wrapper = shallow(<OutsideClickHandler onOutsideClick={spy} />);
        const instance = wrapper.instance();

        instance.childNode = {};
        instance._isMounted = true;
        expect(contains(instance.childNode, target)).to.equal(false);

        instance.onMouseUp(event);

        expect(spy).to.have.property('callCount', 1);
        expect(spy.firstCall.args).to.eql([event]);
      });
    });

  });

  describe.skip('lifecycle methods', () => {
    wrap()
    .withOverride(() => document, 'attachEvent', () => sinon.stub())
    .describe('#componentDidMount', () => {
      let addEventListenerStub;
      beforeEach(() => {
        addEventListenerStub = sinon.stub(document, 'addEventListener');
      });

      it('document.addEventListener is called with `click` & onOutsideClick', () => {
        const wrapper = mount(<OutsideClickHandler />);
        const { onOutsideClick } = wrapper.instance();
        expect(addEventListenerStub.calledWith('click', onOutsideClick, true)).to.equal(true);
      });

      it('document.attachEvent is called if addEventListener is not available', () => {
        document.addEventListener = undefined;

        const wrapper = mount(<OutsideClickHandler />);
        const { onOutsideClick } = wrapper.instance();
        expect(document.attachEvent.calledWith('onclick', onOutsideClick)).to.equal(true);
      });
    });

    wrap()
    .withOverride(() => document, 'detachEvent', () => sinon.stub())
    .describe('#componentWillUnmount', () => {
      let removeEventListenerSpy;
      beforeEach(() => {
        removeEventListenerSpy = sinon.spy(document, 'removeEventListener');
      });

      it('document.removeEventListener is called with `click` and props.onOutsideClick', () => {
        const wrapper = mount(<OutsideClickHandler />);
        const { onOutsideClick } = wrapper.instance();

        wrapper.instance().componentWillUnmount();
        expect(removeEventListenerSpy.calledWith('click', onOutsideClick, true)).to.equal(true);
      });

      it('document.detachEvent is called if document.removeEventListener is not available', () => {
        document.removeEventListener = undefined;

        const wrapper = mount(<OutsideClickHandler />);
        const { onOutsideClick } = wrapper.instance();

        wrapper.instance().componentWillUnmount();
        expect(document.detachEvent.calledWith('onclick', onOutsideClick)).to.equal(true);
      });
    });
  });
});
