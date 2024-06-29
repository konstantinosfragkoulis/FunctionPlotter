importScripts('nerdamer/nerdamer.core.js', 'nerdamer/Algebra.js', 'nerdamer/Extra.js', 'nerdamer/Calculus.js', 'nerdamer/Solve.js');

const radToDeg = 180 / Math.PI;
let ranges = [];

function updateGraph(expr, _range, is3D) {
    
    let boxesInfo = [];

    if(is3D) {
        for (let x = _range[0]; x < _range[1]; x += 0.2) {
            for (let y = -5; y < 5; y += 0.2) {
                let z = expr.sub('x', x).sub('y', y).solveFor('z');
                if (!Array.isArray(z)) z = [z];

                for (let i = 0; i < z.length; i++) {
                    z[i] = z[i].evaluate();
                    console.log("Z: ", z[i])

                    const midX = x;
                    const midY = y;
                    const midZ = z[i];

                    const boxInfo = {
                        position: { x: midX, y: midY, z: midZ },
                        size: { width: 0.01, height: 0.01, depth: 0.01 },
                        color: 'red',
                        rotation: { x: 0, y: 0, z: 0 }
                    };
                    console.log(`Worker ${i} x = `, x, " y = ", y, " z = ", z[i])

                    boxesInfo.push(boxInfo);
                }
            }
        }
    } else {
        averageYs = 0;
        for (let x = -2; x < 2; x += 1) {
            let y = expr.sub('x', x).solveFor('y');
            if (!Array.isArray(y)) y = [y];
            averageYs += y.length;
        }

        averageXs = 0;
        for (let y = -2; y < 2; y += 1) {
            let x = expr.sub('y', y).solveFor('x');
            if (!Array.isArray(x)) x = [x];
            averageXs += x.length;
        }


        console.log("Avergae Xs: ", averageXs, "Average Ys: ", averageYs);

        if(averageXs > averageYs) {
            for (let x = _range[0]; x < _range[1]; x += 0.01) {
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

                        const deltaY = currentY2 - currentY1;
                        const midX = x + 0.0025;
                        const midY = (currentY1 + currentY2) / 2;
                        const length = Math.sqrt(0.000025 + Math.pow(deltaY, 2));
                        const angle = Math.atan2(deltaY, 0.005) * radToDeg;

                        const boxInfo = {
                            position: { x: midX, y: midY, z: 0 },
                            size: { width: length, height: 0.01, depth: 0.01 },
                            color: 'red',
                            rotation: { x: 0, y: 0, z: angle }
                        };

                        boxesInfo.push(boxInfo);
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

                        const deltaY = currentY2 - currentY1;
                        const midX = x + 0.0025;
                        const midY = (currentY1 + currentY2) / 2;
                        const length = Math.sqrt(0.000025 + Math.pow(deltaY, 2));
                        const angle = Math.atan2(deltaY, 0.005) * radToDeg;

                        const boxInfo = {
                            position: { x: midX, y: midY, z: 0 },
                            size: { width: length, height: 0.01, depth: 0.01 },
                            color: 'red',
                            rotation: { x: 0, y: 0, z: angle }
                        };

                        boxesInfo.push(boxInfo);
                    }
                }
            }
        } else {
            for (let y = _range[0]; y < _range[1]; y += 0.01) {
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

                        const deltaX = currentX2 - currentX1;
                        const midX = (currentX1 + currentX2) / 2;
                        const midY = y + 0.0025;
                        const length = Math.sqrt(0.000025 + Math.pow(deltaX, 2));
                        const angle = Math.atan2(deltaX, 0.005) * radToDeg;

                        const boxInfo = {
                            position: { x: midX, y: midY, z: 0 },
                            size: { width: length, height: 0.01, depth: 0.01 },
                            color: 'red',
                            rotation: { x: 0, y: 0, z: angle }
                        };

                        boxesInfo.push(boxInfo);
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

                        const deltaX = currentX2 - currentX1;
                        const midX = (currentX1 + currentX2) / 2;
                        const midY = y + 0.0025; 
                        const length = Math.sqrt(0.000025 + Math.pow(deltaX, 2));
                        const angle = Math.atan2(deltaX, 0.005) * radToDeg;

                        const boxInfo = {
                            position: { x: midX, y: midY, z: 0 },
                            size: { width: length, height: 0.01, depth: 0.01 },
                            color: 'red',
                            rotation: { x: 0, y: 0, z: angle }
                        };

                        boxesInfo.push(boxInfo);
                    }
                }
            }
        }
    }

    
    console.log("Boxes info: ", boxesInfo);
    return boxesInfo;
}

self.addEventListener('message', (e) => {
    var functionText = e.data.functionText;
    const range = e.data.range;

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

    if(functionText.includes('z')) {
        const result = updateGraph(expr, range, true);
    
        self.postMessage(result);
    } else {
        const result = updateGraph(expr, range, false);
    
        self.postMessage(result);
    }
});
