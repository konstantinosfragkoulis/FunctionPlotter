document.getElementById('functionInput').addEventListener('change', function(event) {
    let functionText = event.target.value;
    try {
        
        const workers = [];
        var clearedScene = false;

        const numCores = navigator.hardwareConcurrency;
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
            console.log(`Created worker ${i}.`);
        
            worker.onmessage = function(e) {
                const boxesInfo = e.data;
    
                const sceneEl = document.querySelector('a-scene');
                if(!clearedScene) {
                    const graphLines = document.querySelectorAll('.graph-line');
                    graphLines.forEach(graphLine => graphLine.remove());
                    clearedScene = true;
                    console.log('Scene cleared.');
                }

                const fragment = document.createDocumentFragment();
    

                boxesInfo.forEach(boxInfo => {
                    const boxEl = document.createElement('a-box');
                    boxEl.setAttribute('width', boxInfo.size.width.toString());
                    boxEl.setAttribute('height', boxInfo.size.height.toString());
                    boxEl.setAttribute('depth', boxInfo.size.depth.toString());
                    boxEl.setAttribute('color', boxInfo.color);
                    boxEl.setAttribute('position', `${boxInfo.position.x} ${boxInfo.position.y} ${boxInfo.position.z}`);
                    boxEl.setAttribute('rotation', `${boxInfo.rotation.x} ${boxInfo.rotation.y} ${boxInfo.rotation.z}`);
                    boxEl.classList.add('graph-line');
                    fragment.appendChild(boxEl);
                });
    
                sceneEl.appendChild(fragment);

                worker.terminate();
                console.log(`Worker ${i} terminated.`);
            };
        
            worker.onerror = function(error) {
                console.error(`Error in Worker ${i}:`, error.message);
            };
        
            worker.postMessage({ functionText: functionText, range: ranges[i]});

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
