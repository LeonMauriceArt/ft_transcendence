import * as tf from '@tensorflow/tfjs';

class PongAI {
    constructor() {
        this.model = this.createModel();
    }

    createModel() {
        const model = tf.sequential();
        model.add(tf.layers.dense({units: 64, activation: 'relu', inputShape: [5]}));
        model.add(tf.layers.dense({units: 32, activation: 'relu'}));
        model.add(tf.layers.dense({units: 3, activation: 'softmax'}));
        model.compile({
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        return model;
    }
}

export default PongAI;
