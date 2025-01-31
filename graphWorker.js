importScripts('nerdamer/nerdamer.core.js', 'nerdamer/Algebra.js', 'nerdamer/Extra.js', 'nerdamer/Calculus.js', 'nerdamer/Solve.js');

function compileSolutions(expr, variable, dependencies) {
    try {
        let solutions = expr.solveFor(variable);
        if (!Array.isArray(solutions)) solutions = [solutions];
        return solutions.map(sol => {
            const func = nerdamer(sol).buildFunction(dependencies);
            return (...args) => {
                try {
                    const result = func(...args);
                    return typeof result === 'number' ? result : NaN;
                } catch (e) {
                    return NaN;
                }
            };
        });
    } catch (e) {
        return null;
    }
}

function sample3D(expr, range) {
    const positions = [];
    const step = 0.1;

    const zFuncs = compileSolutions(expr, 'z', ['x', 'y']);
    if (!zFuncs) return positions;

    for (let x = range[0]; x < range[1]; x += step) {
        for (let y = -5; y < 5; y += step) {
            for (const zFunc of zFuncs) {
                const z = zFunc(x, y);
                if (!isNaN(z)) {
                    positions.push(x, y, z);
                }
            }
        }
    }
    return positions;
}

function sample2D(expr, range, variables) {
    const positions = [];
    const [varX, varY] = variables;
    const step = 0.01;

    const yFuncs = compileSolutions(expr, varY, [varX]);
    if (yFuncs) {
        for (const yFunc of yFuncs) {
            let prevX = range[0];
            let prevY = yFunc(prevX);
            for (let x = prevX + step; x <= range[1]; x += step) {
                const y = yFunc(x);
                if (!isNaN(y) && !isNaN(prevY)) {
                    positions.push(prevX, prevY, 0, x, y, 0);
                }
                prevX = x;
                prevY = y;
            }
        }
    } else {
        const xFuncs = compileSolutions(expr, varX, [varY]);
        if (xFuncs) {
            for (const xFunc of xFuncs) {
                let prevY = range[0];
                let prevX = xFunc(prevY);
                for (let y = prevY + step; y <= range[1]; y += step) {
                    const x = xFunc(y);
                    if (!isNaN(x) && !isNaN(prevX)) {
                        positions.push(prevX, prevY, 0, x, y, 0);
                    }
                    prevY = y;
                    prevX = x;
                }
            }
        }
    }
    return positions;
}

self.addEventListener('message', (e) => {
    const { functionText, range } = e.data;
    let expr;
    try {
        expr = nerdamer(functionText);
    } catch (e) {
        self.postMessage({ error: "Invalid equation" });
        return;
    }

    const variables = ['x', 'y', 'z'].filter(v => functionText.includes(v));
    let positions;

    if (variables.length === 3) {
        positions = sample3D(expr, range);
    } else if (variables.length === 2) {
        positions = sample2D(expr, range, variables);
    } else {
        self.postMessage({ error: "Unsupported number of variables" });
        return;
    }

    self.postMessage({
        positions: new Float32Array(positions),
        variables: variables
    });
});
