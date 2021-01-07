import React from 'react';
import {
  settings,
  calcSpeed,
  animateBack,
  animateOut,
  dragableTouchmove,
  mouseCoordinatesFromEvent,
  touchCoordinatesFromEvent,
} from './constant';

const TinderCard = React.forwardRef(({ children, className }, ref) => {
  const swipeAlreadyReleased = React.useRef(false);

  const element = React.useRef();

  React.useImperativeHandle(ref, () => ({
    async swipe(dir = 'right') {
      const power = 1000;
      const disturbance = (Math.random() - 0.5) * 100;
      if (dir === 'right') {
        await animateOut(element.current, { x: power, y: disturbance }, true);
      } else if (dir === 'left') {
        await animateOut(element.current, { x: -power, y: disturbance }, true);
      } else if (dir === 'up') {
        await animateOut(element.current, { x: disturbance, y: power }, true);
      } else if (dir === 'down') {
        await animateOut(element.current, { x: disturbance, y: -power }, true);
      }
      element.current.style.display = 'none';
    },
  }));

  const handleSwipeReleased = React.useCallback(
    async (element, speed) => {
      if (swipeAlreadyReleased.current) {
        return;
      }
      swipeAlreadyReleased.current = true;

      // Check if this is a swipe
      if (
        Math.abs(speed.x) > settings.swipeThreshold ||
        Math.abs(speed.y) > settings.swipeThreshold
      ) {
        await animateOut(element, speed);
        element.style.display = 'none';
        return;
      }

      // Card was not flicked away, animate back to start
      animateBack(element);
    },
    [swipeAlreadyReleased]
  );

  const handleSwipeStart = React.useCallback(() => {
    swipeAlreadyReleased.current = false;
  }, [swipeAlreadyReleased]);

  React.useLayoutEffect(() => {
    let offset = { x: null, y: null };
    let speed = { x: 0, y: 0 };
    let lastLocation = { x: 0, y: 0, time: new Date().getTime() };
    let mouseIsClicked = false;

    element.current.addEventListener('touchstart', (ev) => {
      ev.preventDefault();
      handleSwipeStart();
      offset = {
        x: -touchCoordinatesFromEvent(ev).x,
        y: -touchCoordinatesFromEvent(ev).y,
      };
    });

    element.current.addEventListener('mousedown', (ev) => {
      ev.preventDefault();
      mouseIsClicked = true;
      handleSwipeStart();
      offset = {
        x: -mouseCoordinatesFromEvent(ev).x,
        y: -mouseCoordinatesFromEvent(ev).y,
      };
    });

    element.current.addEventListener('touchmove', (ev) => {
      ev.preventDefault();
      const newLocation = dragableTouchmove(
        touchCoordinatesFromEvent(ev),
        element.current,
        offset,
        lastLocation
      );
      speed = calcSpeed(lastLocation, newLocation);
      lastLocation = newLocation;
    });

    element.current.addEventListener('mousemove', (ev) => {
      ev.preventDefault();
      if (mouseIsClicked) {
        const newLocation = dragableTouchmove(
          mouseCoordinatesFromEvent(ev),
          element.current,
          offset,
          lastLocation
        );
        speed = calcSpeed(lastLocation, newLocation);
        lastLocation = newLocation;
      }
    });

    element.current.addEventListener('touchend', (ev) => {
      ev.preventDefault();
      handleSwipeReleased(element.current, speed);
    });

    element.current.addEventListener('mouseup', (ev) => {
      if (mouseIsClicked) {
        ev.preventDefault();
        mouseIsClicked = false;
        handleSwipeReleased(element.current, speed);
      }
    });

    element.current.addEventListener('mouseleave', (ev) => {
      if (mouseIsClicked) {
        ev.preventDefault();
        mouseIsClicked = false;
        handleSwipeReleased(element.current, speed);
      }
    });
  }, []);

  return React.createElement('div', { ref: element, className }, children);
});

export default TinderCard;
