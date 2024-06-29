importScripts('nerdamer/nerdamer.core.js', 'nerdamer/Algebra.js', 'nerdamer/Extra.js', 'nerdamer/Calculus.js', 'nerdamer/Solve.js');

const radToDeg = 180 / Math.PI;

function updateGraph(expr, _range, variables) {
    
    let boxesInfo = [];

    if(variables.length === 3) {
        for (let x = _range[0]; x < _range[1]; x += 0.1) {
            for (let y = -5; y < 5; y += 0.1) {
                let z = expr.sub('x', x).sub('y', y).solveFor('z');
                if (!Array.isArray(z)) z = [z];

                for (let i = 0; i < z.length; i++) {
                    z[i] = z[i].evaluate();

                    const midX = x;
                    const midY = y;
                    const midZ = z[i];

                    const boxInfo = {
                        position: { x: midX, y: midY, z: midZ+1-1 },
                        size: { width: 0.01, height: 0.01, depth: 0.01 },
                        color: 'red',
                        rotation: { x: 0, y: 0, z: 0 }
                    };

                    boxesInfo.push(boxInfo);
                }
            }
        }
    } else if(variables.length === 2) {
        let varx = variables[0];
        let vary = variables[1];
        averageYs = 0;
        for (let x = -2; x < 2; x += 1) {
            let y = expr.sub(varx, x).solveFor(vary);
            if (!Array.isArray(y)) y = [y];
            averageYs += y.length;
        }

        averageXs = 0;
        for (let y = -2; y < 2; y += 1) {
            let x = expr.sub(vary, y).solveFor(varx);
            if (!Array.isArray(x)) x = [x];
            averageXs += x.length;
        }

        if(averageXs > averageYs) {
            for (let x = _range[0]; x < _range[1]; x += 0.01) {
                let y1 = expr.sub(varx, x).solveFor(vary);
                let y2 = expr.sub(varx, x + 0.005).solveFor(vary);

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

                        var deltaY = currentY2 - currentY1;
                        var midX = 0;
                        var midY = 0;
                        var length = Math.sqrt(0.000025 + Math.pow(deltaY, 2));
                        var angle = Math.atan2(deltaY, 0.005) * radToDeg;
                        var rot = { x: 0, y: 0, z: angle };

                        if(variables[0] === 'x' && variables[1] === 'y') {
                            midX = x + 0.0025;
                            midY = (currentY1 + currentY2) / 2;
                            midZ = 0;
                            rot = { x: 0, y: 0, z: angle };
                        } else if(variables[0] === 'x' && variables[1] === 'z') {
                            midX = x + 0.0025;
                            midY = 0;
                            midZ = (currentY1 + currentY2) / 2;
                            rot = { x: 0, y: angle, z: 0 };
                        } else if(variables[0] === 'y' && variables[1] === 'z') {
                            midX = 0;
                            midY = (currentY1 + currentY2) / 2;
                            midZ = x + 0.0025;
                            rot = { x: angle, y: 0, z: 0 };
                        }

                        const boxInfo = {
                            position: { x: midX, y: midY, z: midZ },
                            size: { width: length, height: 0.01, depth: 0.01 },
                            color: 'red',
                            rotation: rot
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

                        var deltaY = currentY2 - currentY1;
                        var midX = 0;
                        var midY = 0;
                        var length = Math.sqrt(0.000025 + Math.pow(deltaY, 2));
                        var angle = Math.atan2(deltaY, 0.005) * radToDeg;
                        var rot = { x: 0, y: 0, z: angle };

                        if(variables[0] === 'x' && variables[1] === 'y') {
                            midX = x + 0.0025;
                            midY = (currentY1 + currentY2) / 2;
                            midZ = 0;
                            rot = { x: 0, y: 0, z: angle };
                        } else if(variables[0] === 'x' && variables[1] === 'z') {
                            midX = x + 0.0025;
                            midY = 0;
                            midZ = (currentY1 + currentY2) / 2;
                            rot = { x: 0, y: angle, z: 0 };
                        } else if(variables[0] === 'y' && variables[1] === 'z') {
                            midX = 0;
                            midY = (currentY1 + currentY2) / 2;
                            midZ = x + 0.0025;
                            rot = { x: angle, y: 0, z: 0 };
                        }

                        const boxInfo = {
                            position: { x: midX, y: midY, z: midZ },
                            size: { width: length, height: 0.01, depth: 0.01 },
                            color: 'red',
                            rotation: rot
                        };

                        boxesInfo.push(boxInfo);
                    }
                }
            }
        } else {
            for (let y = _range[0]; y < _range[1]; y += 0.01) {
                let x1 = expr.sub(vary, y).solveFor(varx);
                let x2 = expr.sub(vary, y + 0.005).solveFor(varx);

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

                        var deltaX = currentX2 - currentX1;
                        var midX = (currentX1 + currentX2) / 2;
                        var midY = y + 0.0025;
                        var midZ = 0;
                        var length = Math.sqrt(0.000025 + Math.pow(deltaX, 2));
                        var angle = Math.atan2(deltaX, 0.005) * radToDeg;
                        var rot = { x: 0, y: 0, z: angle };

                        if(variables[0] === 'x' && variables[1] === 'y') {
                            midX = (currentX1 + currentX2) / 2;
                            midY = y + 0.0025;
                            midZ = 0;
                            rot = { x: 0, y: 0, z: angle };
                        } else if(variables[0] === 'x' && variables[1] === 'z') {
                            midX = x + 0.0025;
                            midY = 0;
                            midZ = (currentX1 + currentX2) / 2;
                            rot = { x: 0, y: angle, z: 0 };
                        } else if(variables[0] === 'y' && variables[1] === 'z') {
                            midX = 0;
                            midY = x + 0.0025;
                            midZ = (currentX1 + currentX2) / 2;
                            rot = { x: angle, y: 0, z: 0 };
                        }

                        const boxInfo = {
                            position: { x: midX, y: midY, z: midZ },
                            size: { width: length, height: 0.01, depth: 0.01 },
                            color: 'red',
                            rotation: rot
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

                        var deltaX = currentX2 - currentX1;
                        var midX = 0
                        var midY = 0; 
                        var midZ = 0;
                        var length = Math.sqrt(0.000025 + Math.pow(deltaX, 2));
                        var angle = Math.atan2(deltaX, 0.005) * radToDeg;
                        var rot = { x: 0, y: 0, z: angle };

                        if(variables[0] === 'x' && variables[1] === 'y') {
                            midX = (currentX1 + currentX2) / 2;
                            midY = y + 0.0025;
                            midZ = 0;
                            rot = { x: 0, y: 0, z: angle };
                        } else if(variables[0] === 'x' && variables[1] === 'z') {
                            midX = y + 0.0025;
                            midY = 0;
                            midZ = (currentX1 + currentX2) / 2;
                            rot = { x: 0, y: angle, z: 0 };
                        } else if(variables[0] === 'y' && variables[1] === 'z') {
                            midX = 0;
                            midY = y + 0.0025;
                            midZ = (currentX1 + currentX2) / 2;
                            rot = { x: angle, y: 0, z: 0 };
                        }

                        const boxInfo = {
                            position: { x: midX, y: midY, z: midZ },
                            size: { width: length, height: 0.01, depth: 0.01 },
                            color: 'red',
                            rotation: rot
                        };

                        boxesInfo.push(boxInfo);
                    }
                }
            }
        }
    }

    

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

    let variables = [];
    if(functionText.includes('x')) variables.push('x');
    if(functionText.includes('y')) variables.push('y');
    if(functionText.includes('z')) variables.push('z');


    const expr = nerdamer(functionText);
    console.log("Parsed expression: ", expr);

    if(functionText.includes('z')) {
        const result = updateGraph(expr, range, variables);
    
        self.postMessage(result);
    } else {
        const result = updateGraph(expr, range, variables);
    
        self.postMessage(result);
    }
});
