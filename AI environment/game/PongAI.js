import * as tf from '@tensorflow/tfjs';

class PongAI {
    constructor() {
        this.model = this.createModel();
        this.memory = [];
        this.currentAction = 2;
        this.lastDecisionTime = Date.now();
    }

    createModel() {
        const model = tf.sequential();
    
        model.add(tf.layers.dense({units: 128, activation: 'relu', inputShape: [9]}));
        model.add(tf.layers.dense({units: 256, activation: 'relu'}));
        model.add(tf.layers.dense({units: 64, activation: 'relu'}));
        model.add(tf.layers.dense({units: 3, activation: 'softmax'}));
    
        model.compile({
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
    
        return model;
    }

    displayMemory() {
        console.log(this.memory);
    }

    remember(state, action, reward, nextState) {
        this.memory.push({
            state: state,
            action: action,
            reward: reward,
            nextState: nextState
        });
        const maxSize = 1000;
        if (this.memory.length > maxSize) {
            this.memory.shift();
        }
    }
    
    actionToOneHot(action) {
        return Array.from({length: actionsCount}, (_, i) => i === action ? 1 : 0);
    }

    async decideAction(currentState) {
        const stateTensor = tf.tensor2d([currentState]);
        const predictions = await this.model.predict(stateTensor).data();
        stateTensor.dispose();
    
        let maxPredictionIndex = 0;
        let maxPredictionValue = predictions[0];
    
        for (let i = 1; i < predictions.length; i++) {
            if (predictions[i] > maxPredictionValue) {
                maxPredictionValue = predictions[i];
                maxPredictionIndex = i;
            }
        }
    
        return maxPredictionIndex;
    }

    reward(rewardValue) {
        if (this.memory.length > 0) {
            let lastExperience = this.memory[this.memory.length - 1];
            if (lastExperience.reward != null) {
                lastExperience.reward += rewardValue; // Accumule la récompense
            } else {
                lastExperience.reward = rewardValue;
            }
        }
    }
}

export default PongAI;
