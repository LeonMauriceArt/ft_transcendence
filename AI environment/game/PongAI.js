import * as tf from '@tensorflow/tfjs';

class PongAI {
    constructor() {
        this.model = this.createModel();
    }

    createModel() {
        const model = tf.sequential();
        model.add(tf.layers.dense({units: 64, activation: 'relu', inputShape: [8]}));
        model.add(tf.layers.dense({units: 32, activation: 'relu'}));
        model.add(tf.layers.dense({units: 3, activation: 'softmax'}));
        model.compile({
            optimizer: 'adam',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
        return model;
    }

    async train() {
        // Supposons que memory contient des expériences sous la forme {currentState, action, reward, nextState}
        const experiences = this.memory; // Ou une méthode pour extraire des expériences de la mémoire de replay
    
        // Transformer les expériences en tenseurs
        const statesTensor = tf.tensor2d(experiences.map(e => e.currentState));
        const actionsTensor = tf.tensor2d(experiences.map(e => this.actionToOneHot(e.action))); // Convertit l'action en vecteur one-hot si nécessaire
        const rewardsTensor = tf.tensor1d(experiences.map(e => e.reward));
    
        // Entraîner le modèle. Ici, vous utilisez directement les récompenses comme étiquettes
        const h = await this.model.fit(statesTensor, actionsTensor, {
            epochs: 10 // Ajustez selon les besoins
        });
    
        // Libération de la mémoire des tenseurs
        statesTensor.dispose();
        actionsTensor.dispose();
        rewardsTensor.dispose();
    
        return h; // Retourner l'historique de l'entraînement pour analyse
    }
    
    actionToOneHot(action) {
        return Array.from({length: actionsCount}, (_, i) => i === action ? 1 : 0);
    }

    async decideAction(currentState) {
        // Transformer l'état actuel en tenseur 2D (1, nombreDentrées)
        // Supposons que currentState est un tableau de valeurs représentant l'état
        const stateTensor = tf.tensor2d([currentState]);
        const predictions = await this.model.predict(stateTensor).data();
        stateTensor.dispose();
        const action = predictions.indexOf(Math.max(...predictions));

        return action;
    }
}

export default PongAI;
