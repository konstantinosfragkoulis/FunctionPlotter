let completedWorkers = 0;
const numCores = navigator.hardwareConcurrency;

document.getElementById('functionInput').addEventListener('change', function(event) {
    let functionText = event.target.value;
    try {
        completedWorkers = 0;
        allPositions = [];
        allVariables = null;
        const workers = [];
        var clearedScene = false;

        console.log(`Number of cores: ${numCores}`);

        const totalStart = -5;
        const totalEnd = 5;
        const totalRange = totalEnd - totalStart;
        const rangeSize = totalRange / numCores;
        const ranges = [];
        for (let i = 0; i < numCores; i++) {
            const start = totalStart + i * rangeSize;
            const end = start + rangeSize;
            ranges.push([start, end]);
        }
        console.log(ranges);

        for (let i = 0; i < numCores; i++) {
            const worker = new Worker('graphWorker.js');
            completedWorkers++;
            updateProgressBar();
            console.log(`Created worker ${i}.`);
        
            worker.onmessage = function(e) {
                if (e.data.error) {
                    console.error(e.data.error);
                    worker.terminate();
                    return;
                }
                
                const positions = e.data.positions;
                const variables = e.data.variables;
                if (!allVariables) {
                    allVariables = variables;
                }
                allPositions.push(...positions);
                
                worker.terminate();
                console.log(`Worker ${i} terminated.`);

                if (--completedWorkers === 0) {
                    const sceneEl = document.querySelector('a-scene');
                    if (!clearedScene) {
                        const graphLines = document.querySelectorAll('.graph-line');
                        graphLines.forEach(g => g.remove());
                        clearedScene = true;
                        console.log("Scene cleared.");
                    }
                    const fragment = document.createDocumentFragment();
                    
                    if (allVariables.length === 3) {
                        for (let j = 0; j < allPositions.length; j += 3) {
                            const x = allPositions[j];
                            const y = allPositions[j + 1];
                            const z = allPositions[j + 2];
                            const boxEl = document.createElement('a-box');
                            boxEl.setAttribute('width', "0.02");
                            boxEl.setAttribute('height', "0.02");
                            boxEl.setAttribute('depth', "0.02");
                            boxEl.setAttribute('color', "red");
                            boxEl.setAttribute('position', x + " " + y + " " + z);
                            boxEl.classList.add('graph-line');
                            fragment.appendChild(boxEl);
                        }
                    } else if (allVariables.length === 2) {
                        for (let j = 0; j < allPositions.length; j += 6) {
                            const x1 = allPositions[j];
                            const y1 = allPositions[j + 1];
                            const z1 = allPositions[j + 2];
                            const x2 = allPositions[j + 3];
                            const y2 = allPositions[j + 4];
                            const z2 = allPositions[j + 5];
                            const lineEl = document.createElement('a-entity');
                            lineEl.setAttribute('line', `start: ${x1} ${y1} ${z1}; end: ${x2} ${y2} ${z2}; color: red`);
                            lineEl.classList.add('graph-line');
                            fragment.appendChild(lineEl);
                        }
                    }
                    sceneEl.appendChild(fragment);
                    updateProgressBar();
                }
            };
        
            worker.onerror = function(error) {
                console.error(`Error in Worker ${i}:`, error.message);
            };
        
            worker.postMessage({ functionText: functionText, range: ranges[i] });
            workers.push(worker);
        }

    } catch (error) {
        console.error('Error parsing function.\n', error);
    }
});

function drawAxes() {
    const sceneEl = document.querySelector('a-scene');
    const axisLength = 5;
    createAxisLine(sceneEl, {x: -axisLength, y: 0, z: 0}, {x: axisLength, y: 0, z: 0}, 'red');
    createAxisLine(sceneEl, {x: 0, y: -axisLength, z: 0}, {x: 0, y: axisLength, z: 0}, 'green');
    createAxisLine(sceneEl, {x: 0, y: 0, z: -axisLength}, {x: 0, y: 0, z: axisLength}, 'blue');
}

function createAxisLine(sceneEl, start, end, color) {
    const posX = (start.x + end.x) / 2;
    const posY = (start.y + end.y) / 2;
    const posZ = (start.z + end.z) / 2;
    const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2) + Math.pow(end.z - start.z, 2));

    let rotationX, rotationY, rotationZ;

    rotationX = -Math.atan2(end.z - start.z, Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))) * (180 / Math.PI);
    rotationY = 0;
    rotationZ = -Math.atan2(end.x - start.x, end.y - start.y) * (180 / Math.PI);

    const axisEl = document.createElement('a-cylinder');
    axisEl.setAttribute('radius', '0.01');
    axisEl.setAttribute('height', length);
    axisEl.setAttribute('color', color);
    axisEl.setAttribute('position', `${posX} ${posY} ${posZ}`);
    axisEl.setAttribute('rotation', `${rotationX} ${rotationY} ${rotationZ}`);
    sceneEl.appendChild(axisEl);
}

function addAxisLabels() {
    const sceneEl = document.querySelector('a-scene');
    createAxisLabel(sceneEl, 'X', {x: 2.2, y: 0, z: 0});
    createAxisLabel(sceneEl, 'Y', {x: 0, y: 2.2, z: 0.05});
    createAxisLabel(sceneEl, 'Z', {x: 0, y: 0, z: 2.2});
}

function createAxisLabel(sceneEl, text, position) {
    const textEl = document.createElement('a-text');
    textEl.setAttribute('value', text);
    textEl.setAttribute('color', 'black');
    textEl.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
    textEl.setAttribute('align', 'center');
    sceneEl.appendChild(textEl);
}

document.querySelector('a-scene').addEventListener('loaded', function() {
    drawAxes();
    addAxisLabels();
});

AFRAME.registerComponent('move-up-down', {
    schema: {
      speed: {type: 'number', default: 1}
    },
    init: function () {
      this.direction = 0;
      this.keyDownHandler = this.keyDownHandler.bind(this);
      this.keyUpHandler = this.keyUpHandler.bind(this);
    },
    play: function () {
      window.addEventListener('keydown', this.keyDownHandler);
      window.addEventListener('keyup', this.keyUpHandler);
    },
    pause: function () {
      window.removeEventListener('keydown', this.keyDownHandler);
      window.removeEventListener('keyup', this.keyUpHandler);
      this.direction = 0;
    },
    keyDownHandler: function (evt) {
      if (evt.key === 'q') this.direction = -1;
      if (evt.key === 'e') this.direction = 1;
    },
    keyUpHandler: function (evt) {
      if (evt.key === 'q' && this.direction === -1) this.direction = 0;
      if (evt.key === 'e' && this.direction === 1) this.direction = 0;
    },
    tick: function (time, deltaTime) {
      if (this.direction !== 0) {
        let position = this.el.getAttribute('position');
        position.y += this.direction * this.data.speed * deltaTime / 1000;
        this.el.setAttribute('position', position);
      }
    }
  });

function updateProgressBar() {
    const progressPercentage = (completedWorkers / (numCores*5)) * 100;
    document.getElementById('progressBar').style.width = `${progressPercentage}%`;
}
