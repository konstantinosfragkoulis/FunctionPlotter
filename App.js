document.getElementById('functionInput').addEventListener('change', function(event) {
    let functionText = event.target.value;
    try {
        console.log("Parsing function: ", functionText)
        if (!functionText.includes('=') && (functionText.includes('x') || functionText.includes('y'))) {
            if (functionText.includes('x')) {
                functionText += '=y';
            } else if (functionText.includes('y')) {
                functionText += '=x';
            }
        }
        const expr = nerdamer(functionText);
        console.log("Parsed expression: ", expr);
        updateGraph(expr);
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

const radToDeg = 180 / Math.PI;
function updateGraph(expr) {
    const sceneEl = document.querySelector('a-scene');
    const previousLines = sceneEl.querySelectorAll('.graph-line');
    previousLines.forEach(line => line.parentNode.removeChild(line));

    const fragment = document.createDocumentFragment();

    // Determine if x's correspond to more y's or vice versa
    // We will test on five random x values between -2 and 2
    averageYs = 0;
    for (let x = -2; x < 2; x += 1) {
        let y = expr.sub('x', x).solveFor('y');
        if (!Array.isArray(y)) y = [y];
        averageYs += y.length;
    }
    // We don't actually need to divide by 5
    // averageYs /= 5;

    averageXs = 0;
    for (let y = -2; y < 2; y += 1) {
        let x = expr.sub('y', y).solveFor('x');
        if (!Array.isArray(x)) x = [x];
        averageXs += x.length;
    }
    // We don't actually need to divide by 5
    // averageXs /= 5;


    console.log("Avergae Xs: ", averageXs, "Average Ys: ", averageYs);

    if(averageXs > averageYs) {
        for (let x = -5; x < 5; x += 0.01) {
            let y1 = expr.sub('x', x).solveFor('y');
            let y2 = expr.sub('x', x + 0.005).solveFor('y');

            if (!Array.isArray(y1)) y1 = [y1];
            if (!Array.isArray(y2)) y2 = [y2];
            
            for(let i = 0; i < y1.length; i++) {
                y1[i] = y1[i].evaluate();
            }
            for(let i = 0; i < y2.length; i++) {
                y2[i] = y2[i].evaluate();
            }

            if(y1.length > y2.length) {
                for (let i = 0; i < y1.length; i++) {
                    const currentY1 = y1[i];
                    
                    let currentY2 = y2[0];
                    var minDiff = 999999;
                    for(let j = 0; j < y2.length; j++) {
                        const diff = Math.abs(y2[j] - currentY1);
                        if (diff < minDiff) {
                            minDiff = diff;
                            currentY2 = y2[j];
                            if(minDiff <= 0.005) break;
                        }
                    }

                    const lineEl = document.createElement('a-entity');

                    const deltaY = currentY2 - currentY1;
                    const midX = x + 0.0025;
                    const midY = (currentY1 + currentY2) / 2;
                    const length = Math.sqrt(0.000025 + Math.pow(currentY1, 2));
                    const angle = Math.atan2(currentY1, 0.005) * radToDeg;

                    lineEl.setAttribute('geometry', {
                        primitive: 'box',
                        depth: 0.01,
                        height: 0.01,
                        width: length
                    });
                    lineEl.setAttribute('material', { color: 'red' });
                    lineEl.setAttribute('position', `${midX} ${midY} 0`);
                    lineEl.setAttribute('rotation', `0 0 ${angle}`);
                    lineEl.classList.add('graph-line');
                    fragment.appendChild(lineEl);
                }
            } else {
                for (let i = 0; i < y2.length; i++) {
                    const currentY2 = y2[i];
                    
                    let currentY1 = y1[0];
                    var minDiff = 999999;
                    for(let j = 0; j < y1.length; j++) {
                        const diff = Math.abs(y1[j] - currentY2);
                        if (diff < minDiff) {
                            minDiff = diff;
                            currentY1 = y1[j];
                            if(minDiff <= 0.005) break;
                        }
                    }

                    const lineEl = document.createElement('a-entity');

                    const deltaY = currentY2 - currentY1;
                    const midX = x + 0.0025;
                    const midY = (currentY1 + currentY2) / 2;
                    const length = Math.sqrt(0.000025 + Math.pow(deltaY, 2));
                    const angle = Math.atan2(deltaY, 0.005) * radToDeg;

                    lineEl.setAttribute('geometry', {
                        primitive: 'box',
                        depth: 0.01,
                        height: 0.01,
                        width: length
                    });
                    lineEl.setAttribute('material', { color: 'red' });
                    lineEl.setAttribute('position', `${midX} ${midY} 0`);
                    lineEl.setAttribute('rotation', `0 0 ${angle}`);
                    lineEl.classList.add('graph-line');
                    fragment.appendChild(lineEl);
                }
            }
        }
    } else {
        for (let y = -5; y < 5; y += 0.01) {
            let x1 = expr.sub('y', y).solveFor('x');
            let x2 = expr.sub('y', y + 0.005).solveFor('x');

            if (!Array.isArray(x1)) x1 = [x1];
            if (!Array.isArray(x2)) x2 = [x2];

            for(let i = 0; i < x1.length; i++) {
                x1[i] = x1[i].evaluate();
            }
            for(let i = 0; i < x2.length; i++) {
                x2[i] = x2[i].evaluate();
            }
            
            if(x1.length > x2.length) {
                for (let i = 0; i < x1.length; i++) {
                    const currentX1 = x1[i];
                    
                    let currentX2 = x2[0];
                    var minDiff = 999999;
                    for(let j = 0; j < x2.length; j++) {
                        const diff = Math.abs(x2[j] - currentX1);
                        if (diff < minDiff) {
                            minDiff = diff;
                            currentX2 = x2[j];
                            if(minDiff <= 0.005) break;
                        }
                    }

                    const lineEl = document.createElement('a-entity');

                    const deltaX = currentX2 - currentX1;
                    const midX = (currentX1 + currentX2) / 2;
                    const midY = y + 0.0025;
                    const length = Math.sqrt(0.000025 + Math.pow(deltaX, 2));
                    const angle = Math.atan2(deltaX, 0.005) * radToDeg;

                    lineEl.setAttribute('geometry', {
                        primitive: 'box',
                        depth: 0.01,
                        height: 0.01,
                        width: length
                    });
                    lineEl.setAttribute('material', { color: 'red' });
                    lineEl.setAttribute('position', `${midX} ${midY} 0`);
                    lineEl.setAttribute('rotation', `0 0 ${angle}`);
                    lineEl.classList.add('graph-line');
                    fragment.appendChild(lineEl);
                }
            } else {
                for (let i = 0; i < x2.length; i++) {
                    const currentX2 = x2[i];
                    
                    let currentX1 = x1[0];
                    var minDiff = 999999;
                    for(let j = 0; j < x1.length; j++) {
                        const diff = Math.abs(x1[j] - currentX2);
                        if (diff < minDiff) {
                            minDiff = diff;
                            currentX1 = x1[j];
                            if(minDiff <= 0.005) break;
                        }
                    }

                    const lineEl = document.createElement('a-entity');

                    const deltaX = currentX2 - currentX1;
                    const midX = (currentX1 + currentX2) / 2;
                    const midY = y + 0.0025; 
                    const length = Math.sqrt(0.000025 + Math.pow(deltaX, 2));
                    const angle = Math.atan2(deltaX, 0.005) * radToDeg;

                    lineEl.setAttribute('geometry', {
                        primitive: 'box',
                        depth: 0.01,
                        height: 0.01,
                        width: length
                    });
                    lineEl.setAttribute('material', { color: 'red' });
                    lineEl.setAttribute('position', `${midX} ${midY} 0`);
                    lineEl.setAttribute('rotation', `0 0 ${angle}`);
                    lineEl.classList.add('graph-line');
                    fragment.appendChild(lineEl);
                }
            }
        }
    }

    sceneEl.appendChild(fragment);            
}

document.querySelector('a-scene').addEventListener('loaded', function() {
    drawAxes();
    addAxisLabels();
});