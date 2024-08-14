import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useColorStore = defineStore('color', () => {
    //let maxColor = ref<any[]>([]);
    //let hslColor = ref<any[]>([]);
    const maxColor = ref<string>();

    /*const getImageColor = async (arr: any) => {
        arr.canvas.width = 120;
        arr.canvas.height = 120;
        const ctx = arr.canvas.getContext("2d");
        ctx.drawImage(arr.img, 0, 0, arr.canvas.width, arr.canvas.height);
        
        // 获取图像像素点数据
        const data = ctx.getImageData(0, 0, arr.canvas.width, arr.canvas.height).data;
        // 将像素点转化成颜色数组
        const colorData: any[] = [];
        for (var i = 0; i < data.length; i += 4) {
            colorData.push(`${data[i]},${data[i + 1]},${data[i + 2]}`);
        }
        // 将像素点去重并获取到对应的像素点数量
        const colorObj = {};
        colorData.forEach((val) => {
            if (colorObj[val]) {
                colorObj[val] += 1;
            } else {
                colorObj[val] = 1;
            }
        });

        // 把去重的对象，转化成数组
        const arrKeys = Object.keys(colorObj);
        const colorArr: any[] = [];
        arrKeys.forEach((val) => {
            colorArr.push({
                [val]: colorObj[val],
            });
        });

        // 排序
        colorArr.sort((a, b) => {
            const akeys = Object.keys(a)[0];
            const bkeys = Object.keys(b)[0];
            return b[bkeys] - a[akeys];
        });

        let r = 1,
            g = 1,
            b = 1;
        // 取所有像素的平均值
        for (var row = 0; row < arr.img.height; row++) {
            for (var col = 0; col < arr.img.width; col++) {
                // console.log(data[((arr.img.width * row) + col) * 4])
                if (row == 0) {
                    r += data[arr.img.width * row + col];
                    g += data[arr.img.width * row + col + 1];
                    b += data[arr.img.width * row + col + 2];
                } else {
                    r += data[(arr.img.width * row + col) * 4];
                    g += data[(arr.img.width * row + col) * 4 + 1];
                    b += data[(arr.img.width * row + col) * 4 + 2];
                }
            }
        }

        // 求取平均值
        r /= arr.img.width * arr.img.height;
        g /= arr.img.width * arr.img.height;
        b /= arr.img.width * arr.img.height;

        // 将最终的值取整
        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);

        rgb.value = [r, g, b];
        console.log(colorArr);
        
        const obj1 = [...colorArr.slice(0, 2)][0];
        const data1 = Object.keys(obj1)[0];
        const obj2 = [...colorArr.slice(0, 2)][1];
        const data2 = Object.keys(obj2)[0];
        
        maxColor.value = {
            color1: `rgb(${data1})`,
            color2: `rgb(${data2})`,
        };

        const ctx = arr.canvas.getContext("2d");
        arr.canvas.width = arr.img.width;
        arr.canvas.height = arr.img.height;
        ctx.drawImage(arr.img, 0, 0, arr.canvas.width, arr.canvas.height);

        const imageData = ctx.getImageData(0, 0, arr.canvas.width, arr.canvas.height);
        const data = imageData.data;

        let k = 3; // 聚类数
        // k = await gap(data, 10);
        // console.log(k);

        maxColor.value = quantize(data, k);

        let r = 1,
            g = 1,
            b = 1;
        // 取所有像素的平均值
        for (var row = 0; row < arr.img.height; row++) {
            for (var col = 0; col < arr.img.width; col++) {
                // console.log(data[((arr.img.width * row) + col) * 4])
                if (row == 0) {
                    r += data[arr.img.width * row + col];
                    g += data[arr.img.width * row + col + 1];
                    b += data[arr.img.width * row + col + 2];
                } else {
                    r += data[(arr.img.width * row + col) * 4];
                    g += data[(arr.img.width * row + col) * 4 + 1];
                    b += data[(arr.img.width * row + col) * 4 + 2];
                }
            }
        }

        // 求取平均值
        r /= arr.img.width * arr.img.height;
        g /= arr.img.width * arr.img.height;
        b /= arr.img.width * arr.img.height;

        // 将最终的值取整
        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);

        rgbtohsl([r, g, b]);
    }
    const quantize = (data, k) => {

        // 将颜色值转换为三维向量
        const vectors: any = [];
        for (let i = 0; i < data.length; i += 4) {
            vectors.push([data[i], data[i + 1], data[i + 2]]);
        }

        // 随机选择 K 个聚类中心
        const centers: any = [];
        for (let i = 0; i < k; i++) {
            centers.push(vectors[Math.floor(Math.random() * vectors.length)]);
        }

        // 迭代更新聚类中心
        let iterations = 0;
        while (iterations < 100) {
            // 分配数据点到最近的聚类中心所在的簇中
            const clusters: any = new Array(k).fill(() => []).map(() => []);
            for (let i = 0; i < vectors.length; i++) {
                let minDist = Infinity;
                let minIndex = 0;
                for (let j = 0; j < centers.length; j++) {
                    const dist = distance(vectors[i], centers[j]);
                    if (dist < minDist) {
                        minDist = dist;
                        minIndex = j;
                    }
                }
                clusters[minIndex].push(vectors[i]);
            }

            // 更新聚类中心
            let converged = true;
            for (let i = 0; i < centers.length; i++) {
                const cluster: any = clusters[i];
                if (cluster.length > 0) {
                    const newCenter = cluster
                        .reduce((acc, cur) => [
                            acc[0] + cur[0],
                            acc[1] + cur[1],
                            acc[2] + cur[2],
                        ])
                        .map((val) => val / cluster.length);
                    if (!equal(centers[i], newCenter)) {
                        centers[i] = newCenter;
                        converged = false;
                    }
                }
            }

            if (converged) {
                break;
            }

            iterations++;
        }

        // 将每个像素点的颜色值替换为所在簇的聚类中心的颜色值
        for (let i = 0; i < data.length; i += 4) {
            const vector = [data[i], data[i + 1], data[i + 2]];
            let minDist = Infinity;
            let minIndex = 0;
            for (let j = 0; j < centers.length; j++) {
                const dist = distance(vector, centers[j]);
                if (dist < minDist) {
                    minDist = dist;
                    minIndex = j;
                }
            }
            const center = centers[minIndex];
            data[i] = center[0];
            data[i + 1] = center[1];
            data[i + 2] = center[2];
        }

        // 计算每个颜色值在图像中出现的次数，并按出现次数从大到小排序
        const counts = {};
        for (let i = 0; i < data.length; i += 4) {
            const color = `rgb(${data[i]}, ${data[i + 1]}, ${data[i + 2]})`;
            counts[color] = counts[color] ? counts[color] + 1 : 1;
        }
        const sortedColors = Object.keys(counts).sort(
            (a, b) => counts[b] - counts[a]
        );

        // 取前 k 个颜色作为主要颜色

        return sortedColors.slice(0, k);
    }
    const distance = (a, b) => {
        return Math.sqrt(
            (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
        );
    }

    const equal = (a, b) => {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    }

    const gap = (data, maxK) => {
        const gaps: any = [];
        for (let k = 1; k <= maxK; k++) {
            const quantized = quantize(data, k);
            const gap = logWk(quantized) - logWk(randomData(data.length));
            gaps.push(gap);
        }
        const maxGap = Math.max(...gaps);
        return gaps.findIndex((gap) => gap === maxGap) + 1;
    }

    const logWk = (quantized) => {
        const counts = {};
        for (let i = 0; i < quantized.length; i++) {
            counts[quantized[i]] = counts[quantized[i]] ? counts[quantized[i]] + 1 : 1;
        }
        const n = quantized.length;
        const k = Object.keys(counts).length;
        const wk: any = Object.values(counts).reduce((acc: any, cur: any) => acc + cur * Math.log(cur / n), 0);
        return Math.log(n) + wk / n;
    }

    const randomData = (n) => {
        const data = new Uint8ClampedArray(n * 4);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.floor(Math.random() * 256);
        }
        return data;
    }

    const rgbtohsl = (rgb) => {
        const r = rgb[0] / 255;
        const g = rgb[1] / 255;
        const b = rgb[2] / 255;

        let min = Math.min(r, g, b);
        let max = Math.max(r, g, b);
        let l: number | string = (min + max) / 2;
        let difference = max - min;
        let h, s;
        if (max == min) {
            h = 0;
            s = 0;
        } else {
            s = l > 0.5 ? difference / (2.0 - max - min) : difference / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / difference + (g < b ? 6 : 0);
                    break;
                case g:
                    h = 2.0 + (b - r) / difference;
                    break;
                case b:
                    h = 4.0 + (r - g) / difference;
                    break;
            }
            h = Math.round(h * 60);
        }
        s = Math.round(s * 100 * 1.5) + "%"; //转换成百分比的形式
        l = Math.round(l * 100 * 0.8) + "%";
        const str = ["hsl(" + h + "," + s + "," + l + ")", "hsl(" + h + "," + s + "," + l + ", 0.25)"];
        hslColor.value = str
    }*/
    // return { maxColor, hslColor, getImageColor, rgbtohsl }
    return { maxColor }
})