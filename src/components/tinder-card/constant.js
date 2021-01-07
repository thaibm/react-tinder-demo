/* global WebKitCSSMatrix */
import sleep from 'p-sleep';

export const settings = {
  snapBackDuration: 300,
  maxTilt: 5,
  bouncePower: 0.2,
  swipeThreshold: 300, // px/s
};

const getElementSize = (element) => {
  const elementStyles = window.getComputedStyle(element);
  const widthString = elementStyles.getPropertyValue('width');
  const width = Number(widthString.split('px')[0]);
  const heightString = elementStyles.getPropertyValue('height');
  const height = Number(heightString.split('px')[0]);
  return { x: width, y: height };
};

const pythagoras = (x, y) => {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
};

export const animateOut = async (element, speed, easeIn = false) => {
  const startPos = getTranslate(element);
  const bodySize = getElementSize(document.body);
  const diagonal = pythagoras(bodySize.x, bodySize.y);

  const velocity = pythagoras(speed.x, speed.y);
  const time = diagonal / velocity;
  const multiplier = diagonal / velocity;

  const translateString = translationString(
    speed.x * multiplier + startPos.x,
    -speed.y * multiplier + startPos.y
  );
  let rotateString = '';

  const rotationPower = 200;

  if (easeIn) {
    element.style.transition = 'ease ' + time + 's';
  } else {
    element.style.transition = 'ease-out ' + time + 's';
  }

  if (getRotation(element) === 0) {
    rotateString = rotationString((Math.random() - 0.5) * rotationPower);
  } else if (getRotation(element) > 0) {
    rotateString = rotationString(
      (Math.random() * rotationPower) / 2 + getRotation(element)
    );
  } else {
    rotateString = rotationString(
      ((Math.random() - 1) * rotationPower) / 2 + getRotation(element)
    );
  }

  element.style.transform = translateString + rotateString;

  await sleep(time * 1000);
};

export const animateBack = (element) => {
  element.style.transition = settings.snapBackDuration + 'ms';
  const startingPoint = getTranslate(element);
  const translation = translationString(
    startingPoint.x * -settings.bouncePower,
    startingPoint.y * -settings.bouncePower
  );
  const rotation = rotationString(getRotation(element) * -settings.bouncePower);
  element.style.transform = translation + rotation;

  setTimeout(() => {
    element.style.transform = 'none';
  }, settings.snapBackDuration * 0.75);

  setTimeout(() => {
    element.style.transition = '10ms';
  }, settings.snapBackDuration);
};

export const calcSpeed = (oldLocation, newLocation) => {
  const dx = newLocation.x - oldLocation.x;
  const dy = oldLocation.y - newLocation.y;
  const dt = (newLocation.time - oldLocation.time) / 1000;
  return { x: dx / dt, y: dy / dt };
};

const translationString = (x, y) => {
  const translation = 'translate(' + x + 'px, ' + y + 'px)';
  return translation;
};

const rotationString = (rot) => {
  const rotation = 'rotate(' + rot + 'deg)';
  return rotation;
};

const getTranslate = (element) => {
  const style = window.getComputedStyle(element);
  const matrix = new WebKitCSSMatrix(style.webkitTransform);
  const ans = { x: matrix.m41, y: matrix.m42 };
  return ans;
};

const getRotation = (element) => {
  const style = window.getComputedStyle(element);
  const matrix = new WebKitCSSMatrix(style.webkitTransform);
  const ans = (-Math.asin(matrix.m21) / (2 * Math.PI)) * 360;
  return ans;
};

export const dragableTouchmove = (
  coordinates,
  element,
  offset,
  lastLocation
) => {
  const pos = { x: coordinates.x + offset.x, y: coordinates.y + offset.y };
  const newLocation = { x: pos.x, y: pos.y, time: new Date().getTime() };
  const translation = translationString(pos.x, pos.y);
  const rotCalc = calcSpeed(lastLocation, newLocation).x / 1000;
  const rotation = rotationString(rotCalc * settings.maxTilt);
  element.style.transform = translation + rotation;
  return newLocation;
};

export const touchCoordinatesFromEvent = (e) => {
  const touchLocation = e.targetTouches[0];
  return { x: touchLocation.clientX, y: touchLocation.clientY };
};

export const mouseCoordinatesFromEvent = (e) => {
  return { x: e.clientX, y: e.clientY };
};
