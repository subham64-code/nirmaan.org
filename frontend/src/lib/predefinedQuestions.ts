export interface QuestionBankItem {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: "A" | "B" | "C" | "D";
  marks: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

// Master Predefined Question Bank containing Sets A to I
export const fallbackPredefinedQuestions: QuestionBankItem[] = [
  // ==================== SET A (Master) ====================
  {
    _id: "set-a-1",
    question: "[SET A - Q1] What does the \"Gen\" in GenAI stand for?",
    options: ["General", "Generative", "Genuine", "Genetic"],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-a-2",
    question: "[SET A - Q2] What is the primary function of Generative AI?",
    options: [
      "Search the internet for exact matches.",
      "Alphabetically sort large databases.",
      "Create new content like text, code, or images.",
      "Scan computers for viruses and malware."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-a-3",
    question: "[SET A - Q3] What does LLM stand for in artificial intelligence?",
    options: ["Large Language Model", "Logical Learning Machine", "Linear Logic Matrix", "Localized Language Method"],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-a-4",
    question: "[SET A - Q4] What do we call the text instruction you type into an AI to get a response?",
    options: ["A firewall", "A prompt", "A cookie", "An algorithm"],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-a-5",
    question: "[SET A - Q5] Which of the following is a well-known example of an AI chatbot?",
    options: ["Microsoft Excel", "Adobe Photoshop", "Gemini", "Google Chrome"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-a-6",
    question: "[SET A - Q6] What is \"training data\" in machine learning?",
    options: [
      "The final output the AI produces.",
      "The examples and information used to teach the AI.",
      "The code used to design the computer's hardware.",
      "The electrical power required to run the model."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-a-7",
    question: "[SET A - Q7] In basic statistics, what is the \"mean\" of a dataset?",
    options: [
      "The middle value in a sorted list.",
      "The most frequently occurring value.",
      "The mathematical average of the numbers.",
      "The difference between the highest and lowest value."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-a-8",
    question: "[SET A - Q8] What is a \"hallucination\" in the context of AI?",
    options: [
      "When the AI confidently makes up false information.",
      "When the AI takes too long to load a response.",
      "When the AI perfectly copies a Wikipedia article.",
      "When the computer screen flickers due to high processing."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-a-9",
    question: "[SET A - Q9] What is the primary purpose of a loss function?",
    options: [
      "Determine maximum accuracy on validation data.",
      "Quantify the error between predictions and actual targets.",
      "Initialize neural network weights before training.",
      "Automatically adjust the learning rate."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-a-10",
    question: "[SET A - Q10] What is the role of the discriminator in a GAN?",
    options: [
      "Generate synthetic data from random noise.",
      "Compress input data into a latent space.",
      "Distinguish real training data from fake generated data.",
      "Calculate KL divergence between distributions."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-a-11",
    question: "[SET A - Q11] Which best describes the Central Limit Theorem (CLT)?",
    options: [
      "Sample mean always equals population mean as sample size grows.",
      "Distribution of sample means approaches a normal distribution as sample size increases.",
      "All natural data follows a normal distribution eventually.",
      "Sample variance decreases exponentially with size."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-a-12",
    question: "[SET A - Q12] What is the main difference between L1 (Lasso) and L2 (Ridge) regularization?",
    options: [
      "L1 shrinks weights to exactly zero (feature selection); L2 shrinks them toward zero.",
      "L2 eliminates useless variables; L1 only prevents overfitting.",
      "L1 is for classification; L2 is for regression.",
      "L1 penalizes squared weights; L2 penalizes absolute weights."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-a-13",
    question: "[SET A - Q13] What core mechanism allows Transformers to process sequences?",
    options: [
      "Recurrent hidden states passing info sequentially.",
      "Convolutional filters scanning text in fixed windows.",
      "Self-Attention computing weighted sums of all tokens simultaneously.",
      "Markov chains predicting states from the immediate predecessor."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-a-14",
    question: "[SET A - Q14] What is the goal of K-Means clustering?",
    options: [
      "Predict continuous numerical values.",
      "Group similar unlabeled data points by feature distance.",
      "Classify data into predefined historical categories.",
      "Reduce dataset dimensionality to exactly two features."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-a-15",
    question: "[SET A - Q15] Which scenario describes \"overfitting\"?",
    options: [
      "Poor performance on both training and test data.",
      "Excellent training performance, but poor unseen test performance.",
      "Equal, moderate accuracy on both training and test sets.",
      "Requiring massive computational memory for inference."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-a-16",
    question: "[SET A - Q16] How does increasing the \"temperature\" parameter affect an LLM?",
    options: [
      "Increases processing speed and lowers latency.",
      "Flattens next-token probabilities, making outputs more diverse and random.",
      "Sharpens probabilities, forcing strict output of the most likely token.",
      "Increases the maximum allowed token generation length."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-a-17",
    question: "[SET A - Q17] How do Random Forests differ from Gradient Boosting (e.g., XGBoost)?",
    options: [
      "Forests build trees sequentially to correct errors; XGBoost builds independently.",
      "Forests build independent trees in parallel; XGBoost builds sequentially to correct previous errors.",
      "Forests are only for classification; XGBoost is only for regression.",
      "Forests use deep trees; XGBoost strictly uses single-node stumps."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-a-18",
    question: "[SET A - Q18] In Latent Diffusion Models, where does denoising occur?",
    options: [
      "Directly in the high-dimensional original pixel space.",
      "In the text embedding space provided by CLIP.",
      "In a compressed, lower-dimensional latent space via an Autoencoder.",
      "Inside the discriminator's fully connected layers."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-a-19",
    question: "[SET A - Q19] What is the main computational advantage of Grouped Query Attention (GQA) over Multi-Head Attention (MHA)?",
    options: [
      "Eliminate KV cache entirely, reducing latency to constant time.",
      "Shares Key/Value heads across Query heads, drastically reducing KV cache size and memory bandwidth.",
      "Parallelizes autoregressive generation to output multiple tokens at once.",
      "Improves retrieval accuracy by grouping similar semantic chunks."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-a-20",
    question: "[SET A - Q20] Why is PR-AUC better than ROC-AUC for highly imbalanced datasets?",
    options: [
      "ROC-AUC heavily penalizes false negatives.",
      "ROC-AUC is artificially inflated by massive True Negatives; PR-AUC focuses on the minority positive class.",
      "PR-AUC ensures the calibration curve matches true posterior distribution.",
      "ROC-AUC requires binary labels; PR-AUC uses raw probabilities."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-a-21",
    question: "[SET A - Q21] Why is the Reparameterization Trick necessary in VAEs?",
    options: [
      "Forces the latent space to a uniform distribution to prevent mode collapse.",
      "Isolates randomness to an auxiliary variable, allowing gradient backpropagation.",
      "Scales reconstruction loss to balance the KL divergence term.",
      "Replaces cross-entropy with MSE for continuous generation."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-a-22",
    question: "[SET A - Q22] How does Direct Preference Optimization (DPO) differ from Proximal Policy Optimization (PPO)?",
    options: [
      "DPO trains a reward model first; PPO computes it implicitly.",
      "DPO maps human preferences directly to cross-entropy loss, bypassing a separate reward model and RL loop.",
      "DPO uses actor-critic architecture; PPO only uses an actor.",
      "DPO learns continuously during inference; PPO freezes weights."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-a-23",
    question: "[SET A - Q23] What does the \"Double Descent\" phenomenon describe?",
    options: [
      "Test error spikes at the interpolation threshold, then decreases again as model capacity increases further.",
      "Learning rates must decay in two steps for global convergence.",
      "Two-hidden-layer models have steeper descent curves than deeper ones.",
      "Training loss drops rapidly at initialization and right before convergence."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-a-24",
    question: "[SET A - Q24] In a sparse MoE LLM, what is the risk of top-1/top-2 routing without a load-balancing loss?",
    options: [
      "Memory corruption from routing tokens to identical addresses.",
      "\"Expert collapse\": the router starves most experts by overusing one or two.",
      "Exponential explosion of the KV cache size.",
      "Self-attention miscalculating sequence lengths."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-a-25",
    question: "[SET A - Q25] What is the function of the KL divergence term when maximizing the ELBO in VAEs?",
    options: [
      "Ensures exact pixel match as the primary reconstruction metric.",
      "Regularizes the latent space, forcing the learned posterior to approximate a prior (e.g., standard normal).",
      "Dynamically scales decoder learning rate based on image complexity.",
      "Calculates maximum log-likelihood directly."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },

  // ==================== SET B (Shuffled) ====================
  {
    _id: "set-b-1",
    question: "[SET B - Q1] What do we call the text instruction you type into an AI to get a response?",
    options: ["An algorithm", "A firewall", "A prompt", "A cookie"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-b-2",
    question: "[SET B - Q2] In basic statistics, what is the \"mean\" of a dataset?",
    options: [
      "The difference between the highest and lowest value.",
      "The mathematical average of the numbers.",
      "The most frequently occurring value.",
      "The middle value in a sorted list."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-b-3",
    question: "[SET B - Q3] What does the \"Gen\" in GenAI stand for?",
    options: ["Generative", "Genuine", "Genetic", "General"],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-b-4",
    question: "[SET B - Q4] Which of the following is a well-known example of an AI chatbot?",
    options: ["Adobe Photoshop", "Gemini", "Microsoft Excel", "Google Chrome"],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-b-5",
    question: "[SET B - Q5] What is a \"hallucination\" in the context of AI?",
    options: [
      "When the computer screen flickers due to high processing.",
      "When the AI perfectly copies a Wikipedia article.",
      "When the AI confidently makes up false information.",
      "When the AI takes too long to load a response."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-b-6",
    question: "[SET B - Q6] What is the primary function of Generative AI?",
    options: [
      "Alphabetically sort large databases.",
      "Create new content like text, code, or images.",
      "Search the internet for exact matches.",
      "Scan computers for viruses and malware."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-b-7",
    question: "[SET B - Q7] What does LLM stand for in artificial intelligence?",
    options: ["Logical Learning Machine", "Localized Language Method", "Linear Logic Matrix", "Large Language Model"],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-b-8",
    question: "[SET B - Q8] What is \"training data\" in machine learning?",
    options: [
      "The electrical power required to run the model.",
      "The final output the AI produces.",
      "The code used to design the computer's hardware.",
      "The examples and information used to teach the AI."
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-b-9",
    question: "[SET B - Q9] What core mechanism allows Transformers to process sequences?",
    options: [
      "Recurrent hidden states passing info sequentially.",
      "Self-Attention computing weighted sums of all tokens simultaneously.",
      "Markov chains predicting states from the immediate predecessor.",
      "Convolutional filters scanning text in fixed windows."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-b-10",
    question: "[SET B - Q10] What is the role of the discriminator in a GAN?",
    options: [
      "Calculate KL divergence between distributions.",
      "Generate synthetic data from random noise.",
      "Distinguish real training data from fake generated data.",
      "Compress input data into a latent space."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-b-11",
    question: "[SET B - Q11] What is the main computational advantage of Grouped Query Attention (GQA) over Multi-Head Attention (MHA)?",
    options: [
      "Eliminates KV cache entirely, reducing latency to constant time.",
      "Parallelizes autoregressive generation to output multiple tokens at once.",
      "Shares Key/Value heads across Query heads, drastically reducing KV cache size and memory bandwidth.",
      "Improves retrieval accuracy by grouping similar semantic chunks."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-b-12",
    question: "[SET B - Q12] What does the \"Double Descent\" phenomenon describe?",
    options: [
      "Test error spikes at the interpolation threshold, then decreases again as model capacity increases further.",
      "Learning rates must decay in two steps for global convergence.",
      "Two-hidden-layer models have steeper descent curves than deeper ones.",
      "Training loss drops rapidly at initialization and right before convergence."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-b-13",
    question: "[SET B - Q13] Why is the Reparameterization Trick necessary in VAEs?",
    options: [
      "Scales reconstruction loss to balance the KL divergence term.",
      "Forces the latent space to a uniform distribution to prevent mode collapse.",
      "Replaces cross-entropy with MSE for continuous generation.",
      "Isolates randomness to an auxiliary variable, allowing gradient backpropagation."
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-b-14",
    question: "[SET B - Q14] What is the function of the KL divergence term when maximizing the ELBO in VAEs?",
    options: [
      "Ensures exact pixel match as the primary reconstruction metric.",
      "Calculates maximum log-likelihood directly.",
      "Regularizes the latent space, forcing the learned posterior to approximate a prior.",
      "Dynamically scales decoder learning rate based on image complexity."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-b-15",
    question: "[SET B - Q15] Which scenario describes \"overfitting\"?",
    options: [
      "Poor performance on both training and test data.",
      "Equal, moderate accuracy on both training and test sets.",
      "Requiring massive computational memory for inference.",
      "Excellent training performance, but poor unseen test performance."
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-b-16",
    question: "[SET B - Q16] How do Random Forests differ from Gradient Boosting (e.g., XGBoost)?",
    options: [
      "Forests build independent trees in parallel; XGBoost builds sequentially to correct previous errors.",
      "Forests use deep trees; XGBoost strictly uses single-node stumps.",
      "Forests are only for classification; XGBoost is only for regression.",
      "Forests build trees sequentially to correct errors; XGBoost builds independently."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-b-17",
    question: "[SET B - Q17] What is the primary purpose of a loss function?",
    options: [
      "Quantify the error between predictions and actual targets.",
      "Initialize neural network weights before training.",
      "Determine maximum accuracy on validation data.",
      "Automatically adjust the learning rate."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-b-18",
    question: "[SET B - Q18] How does Direct Preference Optimization (DPO) differ from Proximal Policy Optimization (PPO)?",
    options: [
      "DPO trains a reward model first; PPO computes it implicitly.",
      "DPO maps human preferences directly to cross-entropy loss, bypassing a separate reward model and RL loop.",
      "DPO learns continuously during inference; PPO freezes weights.",
      "DPO uses actor-critic architecture; PPO only uses an actor."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-b-19",
    question: "[SET B - Q19] Which best describes the Central Limit Theorem (CLT)?",
    options: [
      "Distribution of sample means approaches a normal distribution as sample size increases.",
      "Sample mean always equals population mean as sample size grows.",
      "All natural data follows a normal distribution eventually.",
      "Sample variance decreases exponentially with size."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-b-20",
    question: "[SET B - Q20] In Latent Diffusion Models, where does denoising occur?",
    options: [
      "Inside the discriminator's fully connected layers.",
      "Directly in the high-dimensional original pixel space.",
      "In the text embedding space provided by CLIP.",
      "In a compressed, lower-dimensional latent space via an Autoencoder."
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-b-21",
    question: "[SET B - Q21] What is the main difference between L1 (Lasso) and L2 (Ridge) regularization?",
    options: [
      "L1 shrinks weights to exactly zero (feature selection); L2 shrinks them toward zero.",
      "L1 penalizes squared weights; L2 penalizes absolute weights.",
      "L1 is for classification; L2 is for regression.",
      "L2 eliminates useless variables; L1 only prevents overfitting."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-b-22",
    question: "[SET B - Q22] Why is PR-AUC better than ROC-AUC for highly imbalanced datasets?",
    options: [
      "ROC-AUC heavily penalizes false negatives.",
      "PR-AUC ensures the calibration curve matches true posterior distribution.",
      "ROC-AUC is artificially inflated by massive True Negatives; PR-AUC focuses on the minority positive class.",
      "ROC-AUC requires binary labels; PR-AUC uses raw probabilities."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-b-23",
    question: "[SET B - Q23] What is the goal of K-Means clustering?",
    options: [
      "Classify data into predefined historical categories.",
      "Group similar unlabeled data points by feature distance.",
      "Reduce dataset dimensionality to exactly two features.",
      "Predict continuous numerical values."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-b-24",
    question: "[SET B - Q24] How does increasing the \"temperature\" parameter affect an LLM?",
    options: [
      "Increases the maximum allowed token generation length.",
      "Sharpens probabilities, forcing strict output of the most likely token.",
      "Flattens next-token probabilities, making outputs more diverse and random.",
      "Increases processing speed and lowers latency."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-b-25",
    question: "[SET B - Q25] In a sparse MoE LLM, what is the risk of top-1/top-2 routing without a load-balancing loss?",
    options: [
      "\"Expert collapse\": the router starves most experts by overusing one or two.",
      "Self-attention miscalculating sequence lengths.",
      "Memory corruption from routing tokens to identical addresses.",
      "Exponential explosion of the KV cache size."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Hard"
  },

  // ==================== SET C ====================
  {
    _id: "set-c-1",
    question: "[SET C - Q1] What is \"training data\" in machine learning?",
    options: [
      "The examples and information used to teach the AI.",
      "The code used to design the computer's hardware.",
      "The electrical power required to run the model.",
      "The final output the AI produces."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-c-2",
    question: "[SET C - Q2] What does LLM stand for in artificial intelligence?",
    options: ["Localized Language Method", "Large Language Model", "Logical Learning Machine", "Linear Logic Matrix"],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-c-3",
    question: "[SET C - Q3] Which of the following is a well-known example of an AI chatbot?",
    options: ["Google Chrome", "Gemini", "Microsoft Excel", "Adobe Photoshop"],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-c-4",
    question: "[SET C - Q4] What does the \"Gen\" in GenAI stand for?",
    options: ["Genetic", "General", "Generative", "Genuine"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-c-5",
    question: "[SET C - Q5] What do we call the text instruction you type into an AI to get a response?",
    options: ["A firewall", "A cookie", "A prompt", "An algorithm"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-c-6",
    question: "[SET C - Q6] In basic statistics, what is the \"mean\" of a dataset?",
    options: [
      "The middle value in a sorted list.",
      "The mathematical average of the numbers.",
      "The difference between the highest and lowest value.",
      "The most frequently occurring value."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-c-7",
    question: "[SET C - Q7] What is the primary function of Generative AI?",
    options: [
      "Search the internet for exact matches.",
      "Alphabetically sort large databases.",
      "Scan computers for viruses and malware.",
      "Create new content like text, code, or images."
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-c-8",
    question: "[SET C - Q8] What is a \"hallucination\" in the context of AI?",
    options: [
      "When the computer screen flickers due to high processing.",
      "When the AI confidently makes up false information.",
      "When the AI perfectly copies a Wikipedia article.",
      "When the AI takes too long to load a response."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-c-9",
    question: "[SET C - Q9] What is the primary purpose of a loss function?",
    options: [
      "Determine maximum accuracy on validation data.",
      "Automatically adjust the learning rate.",
      "Initialize neural network weights before training.",
      "Quantify the error between predictions and actual targets."
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-c-10",
    question: "[SET C - Q10] In a sparse MoE LLM, what is the risk of top-1/top-2 routing without a load-balancing loss?",
    options: [
      "Exponential explosion of the KV cache size.",
      "Memory corruption from routing tokens to identical addresses.",
      "\"Expert collapse\": the router starves most experts by overusing one or two.",
      "Self-attention miscalculating sequence lengths."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-c-11",
    question: "[SET C - Q11] What is the main difference between L1 (Lasso) and L2 (Ridge) regularization?",
    options: [
      "L1 shrinks weights to exactly zero (feature selection); L2 shrinks them toward zero.",
      "L1 is for classification; L2 is for regression.",
      "L1 penalizes squared weights; L2 penalizes absolute weights.",
      "L2 eliminates useless variables; L1 only prevents overfitting."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-c-12",
    question: "[SET C - Q12] Why is PR-AUC better than ROC-AUC for highly imbalanced datasets?",
    options: [
      "ROC-AUC is artificially inflated by massive True Negatives; PR-AUC focuses on the minority positive class.",
      "ROC-AUC heavily penalizes false negatives.",
      "PR-AUC ensures the calibration curve matches true posterior distribution.",
      "ROC-AUC requires binary labels; PR-AUC uses raw probabilities."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-c-13",
    question: "[SET C - Q13] What is the main computational advantage of Grouped Query Attention (GQA) over Multi-Head Attention (MHA)?",
    options: [
      "Shares Key/Value heads across Query heads, drastically reducing KV cache size and memory bandwidth.",
      "Eliminates KV cache entirely, reducing latency to constant time.",
      "Improves retrieval accuracy by grouping similar semantic chunks.",
      "Parallelizes autoregressive generation to output multiple tokens at once."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-c-14",
    question: "[SET C - Q14] How does Direct Preference Optimization (DPO) differ from Proximal Policy Optimization (PPO)?",
    options: [
      "DPO trains a reward model first; PPO computes it implicitly.",
      "DPO maps human preferences directly to cross-entropy loss, bypassing a separate reward model and RL loop.",
      "DPO learns continuously during inference; PPO freezes weights.",
      "DPO uses actor-critic architecture; PPO only uses an actor."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-c-15",
    question: "[SET C - Q15] How do Random Forests differ from Gradient Boosting (e.g., XGBoost)?",
    options: [
      "Forests build independent trees in parallel; XGBoost builds sequentially to correct previous errors.",
      "Forests build trees sequentially to correct errors; XGBoost builds independently.",
      "Forests are only for classification; XGBoost is only for regression.",
      "Forests use deep trees; XGBoost strictly uses single-node stumps."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-c-16",
    question: "[SET C - Q16] What does the \"Double Descent\" phenomenon describe?",
    options: [
      "Training loss drops rapidly at initialization and right before convergence.",
      "Two-hidden-layer models have steeper descent curves than deeper ones.",
      "Test error spikes at the interpolation threshold, then decreases again as model capacity increases further.",
      "Learning rates must decay in two steps for global convergence."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-c-17",
    question: "[SET C - Q17] What is the function of the KL divergence term when maximizing the ELBO in VAEs?",
    options: [
      "Dynamically scales decoder learning rate based on image complexity.",
      "Calculates maximum log-likelihood directly.",
      "Ensures exact pixel match as the primary reconstruction metric.",
      "Regularizes the latent space, forcing the learned posterior to approximate a prior."
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-c-18",
    question: "[SET C - Q18] Which best describes the Central Limit Theorem (CLT)?",
    options: [
      "Sample variance decreases exponentially with size.",
      "Distribution of sample means approaches a normal distribution as sample size increases.",
      "Sample mean always equals population mean as sample size grows.",
      "All natural data follows a normal distribution eventually."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-c-19",
    question: "[SET C - Q19] What core mechanism allows Transformers to process sequences?",
    options: [
      "Convolutional filters scanning text in fixed windows.",
      "Recurrent hidden states passing info sequentially.",
      "Self-Attention computing weighted sums of all tokens simultaneously.",
      "Markov chains predicting states from the immediate predecessor."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-c-20",
    question: "[SET C - Q20] What is the role of the discriminator in a GAN?",
    options: [
      "Compress input data into a latent space.",
      "Distinguish real training data from fake generated data.",
      "Generate synthetic data from random noise.",
      "Calculate KL divergence between distributions."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-c-21",
    question: "[SET C - Q21] Which scenario describes \"overfitting\"?",
    options: [
      "Equal, moderate accuracy on both training and test sets.",
      "Requiring massive computational memory for inference.",
      "Excellent training performance, but poor unseen test performance.",
      "Poor performance on both training and test data."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-c-22",
    question: "[SET C - Q22] In Latent Diffusion Models, where does denoising occur?",
    options: [
      "Directly in the high-dimensional original pixel space.",
      "In the text embedding space provided by CLIP.",
      "Inside the discriminator's fully connected layers.",
      "In a compressed, lower-dimensional latent space via an Autoencoder."
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-c-23",
    question: "[SET C - Q23] Why is the Reparameterization Trick necessary in VAEs?",
    options: [
      "Replaces cross-entropy with MSE for continuous generation.",
      "Isolates randomness to an auxiliary variable, allowing gradient backpropagation.",
      "Forces the latent space to a uniform distribution to prevent mode collapse.",
      "Scales reconstruction loss to balance the KL divergence term."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-c-24",
    question: "[SET C - Q24] How does increasing the \"temperature\" parameter affect an LLM?",
    options: [
      "Increases processing speed and lowers latency.",
      "Sharpens probabilities, forcing strict output of the most likely token.",
      "Flattens next-token probabilities, making outputs more diverse and random.",
      "Increases the maximum allowed token generation length."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-c-25",
    question: "[SET C - Q25] What is the goal of K-Means clustering?",
    options: [
      "Reduce dataset dimensionality to exactly two features.",
      "Classify data into predefined historical categories.",
      "Group similar unlabeled data points by feature distance.",
      "Predict continuous numerical values."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },

  // ==================== SET D ====================
  {
    _id: "set-d-1",
    question: "[SET D - Q1] What is a \"hallucination\" in the context of AI?",
    options: [
      "When the AI perfectly copies a Wikipedia article.",
      "When the computer screen flickers due to high processing.",
      "When the AI takes too long to load a response.",
      "When the AI confidently makes up false information."
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-d-2",
    question: "[SET D - Q2] What does LLM stand for in artificial intelligence?",
    options: ["Large Language Model", "Logical Learning Machine", "Linear Logic Matrix", "Localized Language Method"],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-d-3",
    question: "[SET D - Q3] In basic statistics, what is the \"mean\" of a dataset?",
    options: [
      "The middle value in a sorted list.",
      "The mathematical average of the numbers.",
      "The most frequently occurring value.",
      "The difference between the highest and lowest value."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-d-4",
    question: "[SET D - Q4] What does the \"Gen\" in GenAI stand for?",
    options: ["General", "Genuine", "Generative", "Genetic"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-d-5",
    question: "[SET D - Q5] What is the primary function of Generative AI?",
    options: [
      "Create new content like text, code, or images.",
      "Search the internet for exact matches.",
      "Alphabetically sort large databases.",
      "Scan computers for viruses and malware."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-d-6",
    question: "[SET D - Q6] What do we call the text instruction you type into an AI to get a response?",
    options: ["A prompt", "A firewall", "An algorithm", "A cookie"],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-d-7",
    question: "[SET D - Q7] Which of the following is a well-known example of an AI chatbot?",
    options: ["Microsoft Excel", "Google Chrome", "Adobe Photoshop", "Gemini"],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-d-8",
    question: "[SET D - Q8] What is \"training data\" in machine learning?",
    options: [
      "The examples and information used to teach the AI.",
      "The final output the AI produces.",
      "The code used to design the computer's hardware.",
      "The electrical power required to run the model."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-d-9",
    question: "[SET D - Q9] What is the main computational advantage of Grouped Query Attention (GQA) over Multi-Head Attention (MHA)?",
    options: [
      "Shares Key/Value heads across Query heads, drastically reducing KV cache size and memory bandwidth.",
      "Eliminates KV cache entirely, reducing latency to constant time.",
      "Improves retrieval accuracy by grouping similar semantic chunks.",
      "Parallelizes autoregressive generation to output multiple tokens at once."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-d-10",
    question: "[SET D - Q10] How do Random Forests differ from Gradient Boosting (e.g., XGBoost)?",
    options: [
      "Forests build trees sequentially to correct errors; XGBoost builds independently.",
      "Forests use deep trees; XGBoost strictly uses single-node stumps.",
      "Forests build independent trees in parallel; XGBoost builds sequentially to correct previous errors.",
      "Forests are only for classification; XGBoost is only for regression."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-d-11",
    question: "[SET D - Q11] What is the function of the KL divergence term when maximizing the ELBO in VAEs?",
    options: [
      "Ensures exact pixel match as the primary reconstruction metric.",
      "Regularizes the latent space, forcing the learned posterior to approximate a prior.",
      "Calculates maximum log-likelihood directly.",
      "Dynamically scales decoder learning rate based on image complexity."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-d-12",
    question: "[SET D - Q12] Which best describes the Central Limit Theorem (CLT)?",
    options: [
      "Sample variance decreases exponentially with size.",
      "Sample mean always equals population mean as sample size grows.",
      "All natural data follows a normal distribution eventually.",
      "Distribution of sample means approaches a normal distribution as sample size increases."
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-d-13",
    question: "[SET D - Q13] What is the role of the discriminator in a GAN?",
    options: [
      "Distinguish real training data from fake generated data.",
      "Compress input data into a latent space.",
      "Calculate KL divergence between distributions.",
      "Generate synthetic data from random noise."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-d-14",
    question: "[SET D - Q14] What does the \"Double Descent\" phenomenon describe?",
    options: [
      "Learning rates must decay in two steps for global convergence.",
      "Test error spikes at the interpolation threshold, then decreases again as model capacity increases further.",
      "Training loss drops rapidly at initialization and right before convergence.",
      "Two-hidden-layer models have steeper descent curves than deeper ones."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-d-15",
    question: "[SET D - Q15] Why is PR-AUC better than ROC-AUC for highly imbalanced datasets?",
    options: [
      "PR-AUC ensures the calibration curve matches true posterior distribution.",
      "ROC-AUC heavily penalizes false negatives.",
      "ROC-AUC is artificially inflated by massive True Negatives; PR-AUC focuses on the minority positive class.",
      "ROC-AUC requires binary labels; PR-AUC uses raw probabilities."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-d-16",
    question: "[SET D - Q16] What is the main difference between L1 (Lasso) and L2 (Ridge) regularization?",
    options: [
      "L1 is for classification; L2 is for regression.",
      "L1 shrinks weights to exactly zero (feature selection); L2 shrinks them toward zero.",
      "L1 penalizes squared weights; L2 penalizes absolute weights.",
      "L2 eliminates useless variables; L1 only prevents overfitting."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-d-17",
    question: "[SET D - Q17] In Latent Diffusion Models, where does denoising occur?",
    options: [
      "Inside the discriminator's fully connected layers.",
      "Directly in the high-dimensional original pixel space.",
      "In a compressed, lower-dimensional latent space via an Autoencoder.",
      "In the text embedding space provided by CLIP."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-d-18",
    question: "[SET D - Q18] How does Direct Preference Optimization (DPO) differ from Proximal Policy Optimization (PPO)?",
    options: [
      "DPO trains a reward model first; PPO computes it implicitly.",
      "DPO uses actor-critic architecture; PPO only uses an actor.",
      "DPO learns continuously during inference; PPO freezes weights.",
      "DPO maps human preferences directly to cross-entropy loss, bypassing a separate reward model and RL loop."
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-d-19",
    question: "[SET D - Q19] What core mechanism allows Transformers to process sequences?",
    options: [
      "Recurrent hidden states passing info sequentially.",
      "Convolutional filters scanning text in fixed windows.",
      "Self-Attention computing weighted sums of all tokens simultaneously.",
      "Markov chains predicting states from the immediate predecessor."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-d-20",
    question: "[SET D - Q20] Why is the Reparameterization Trick necessary in VAEs?",
    options: [
      "Replaces cross-entropy with MSE for continuous generation.",
      "Forces the latent space to a uniform distribution to prevent mode collapse.",
      "Scales reconstruction loss to balance the KL divergence term.",
      "Isolates randomness to an auxiliary variable, allowing gradient backpropagation."
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-d-21",
    question: "[SET D - Q21] Which scenario describes \"overfitting\"?",
    options: [
      "Excellent training performance, but poor unseen test performance.",
      "Equal, moderate accuracy on both training and test sets.",
      "Requiring massive computational memory for inference.",
      "Poor performance on both training and test data."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-d-22",
    question: "[SET D - Q22] What is the goal of K-Means clustering?",
    options: [
      "Classify data into predefined historical categories.",
      "Reduce dataset dimensionality to exactly two features.",
      "Group similar unlabeled data points by feature distance.",
      "Predict continuous numerical values."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-d-23",
    question: "[SET D - Q23] In a sparse MoE LLM, what is the risk of top-1/top-2 routing without a load-balancing loss?",
    options: [
      "Exponential explosion of the KV cache size.",
      "Self-attention miscalculating sequence lengths.",
      "Memory corruption from routing tokens to identical addresses.",
      "\"Expert collapse\": the router starves most experts by overusing one or two."
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-d-24",
    question: "[SET D - Q24] How does increasing the \"temperature\" parameter affect an LLM?",
    options: [
      "Flattens next-token probabilities, making outputs more diverse and random.",
      "Increases processing speed and lowers latency.",
      "Increases the maximum allowed token generation length.",
      "Sharpens probabilities, forcing strict output of the most likely token."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-d-25",
    question: "[SET D - Q25] What is the primary purpose of a loss function?",
    options: [
      "Initialize neural network weights before training.",
      "Determine maximum accuracy on validation data.",
      "Quantify the error between predictions and actual targets.",
      "Automatically adjust the learning rate."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },

  // ==================== SET E (Advanced Python & Core Analytics) ====================
  {
    _id: "set-e-1",
    question: "[SET E - Q1] What will be the output of the following code?\ndata = [1, 2, 3]\ndef modify(lst):\n    lst.append(4)\n\nmodify(data)\nprint(data)",
    options: ["[1, 2, 3]", "[4]", "[1, 2, 3, 4]", "Error"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-e-2",
    question: "[SET E - Q2] Which of the following creates a generator object?",
    options: [
      "[x*x for x in range(5)]",
      "(x*x for x in range(5))",
      "{x*x for x in range(5)}",
      "{x: x*x for x in range(5)}"
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-e-3",
    question: "[SET E - Q3] What is the output?\nx = 10\ndef func():\n    x = 5\n    return x\n\nprint(x, func())",
    options: ["5 5", "10 10", "10 5", "Error"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-e-4",
    question: "[SET E - Q4] Which statement about range() is TRUE?",
    options: [
      "It stores all values in memory",
      "It returns a list",
      "It generates values lazily",
      "It cannot be iterated twice"
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-e-5",
    question: "[SET E - Q5] What will this code print?\na = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)",
    options: ["[1, 2, 3]", "[4]", "[1, 2, 3, 4]", "Error"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-e-6",
    question: "[SET E - Q6] How do you create a shallow copy of a list?",
    options: ["new = list.copy(old)", "new = old", "new = old[:]", "new = copy(old)"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-e-7",
    question: "[SET E - Q7] What is the output?\ndef outer():\n    x = 10\n    def inner():\n        nonlocal x\n        x += 5\n    inner()\n    return x\n\nprint(outer())",
    options: ["10", "15", "5", "Error"],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-e-8",
    question: "[SET E - Q8] Which built-in function is BEST for checking if all values in a dataset are non-zero?",
    options: ["any()", "all()", "sum()", "map()"],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-e-9",
    question: "[SET E - Q9] What will be the result?\ndata = [1, 2, 3, 4]\nresult = list(filter(lambda x: x % 2 == 0, data))\nprint(result)",
    options: ["[1, 3]", "[2, 4]", "[True, False]", "Error"],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-e-10",
    question: "[SET E - Q10] Which statement improves performance when processing large text files?",
    options: [
      "Read the entire file at once",
      "Use recursion",
      "Iterate line by line",
      "Store data in lists"
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },

  // ==================== SET F (ML Essentials) ====================
  {
    _id: "set-f-1",
    question: "[SET F - Q1] What is Machine Learning?",
    options: [
      "A program that runs only once",
      "A system that learns from data and improves automatically",
      "A hardware technology",
      "A type of database"
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-f-2",
    question: "[SET F - Q2] Which of the following is a type of Machine Learning?",
    options: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "All of the above"],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-f-3",
    question: "[SET F - Q3] In supervised learning, the model is trained using:",
    options: ["Only input data", "Only output data", "Input data with correct output labels", "Random data"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-f-4",
    question: "[SET F - Q4] Which algorithm is commonly used for classification problems?",
    options: ["Linear Regression", "K-Means", "Decision Tree", "Apriori"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-f-5",
    question: "[SET F - Q5] What is the main goal of Machine Learning?",
    options: ["Data storage", "Data visualization", "Pattern recognition and prediction", "Data deletion"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-f-6",
    question: "[SET F - Q6] Which of the following is an example of supervised learning?",
    options: ["Customer segmentation", "Spam email detection", "Market basket analysis", "Clustering users"],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-f-7",
    question: "[SET F - Q7] What is a dataset?",
    options: ["A collection of programs", "A collection of algorithms", "A collection of related data", "A collection of computers"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-f-8",
    question: "[SET F - Q8] What is a feature in Machine Learning?",
    options: ["Final prediction", "Input variable used for prediction", "Output label", "Accuracy score"],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-f-9",
    question: "[SET F - Q9] Which ML task predicts a continuous value?",
    options: ["Classification", "Clustering", "Regression", "Association"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-f-10",
    question: "[SET F - Q10] Which of the following is NOT a Machine Learning application?",
    options: ["Recommendation systems", "Image recognition", "Manual data entry", "Fraud detection"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },

  // ==================== SET G (Advanced AI Deep-Dive) ====================
  {
    _id: "set-g-1",
    question: "[SET G - Q1] Why do GNNs use Message Passing instead of standard CNN filters?",
    options: [
      "CNN filters are too fast for nodes.",
      "Graphs lack a fixed grid or node order, so Message Passing enables permutation-invariant aggregation.",
      "Standard CNNs cannot process floating point numbers.",
      "Graphs require deep convolutional scanning at pixel level."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-g-2",
    question: "[SET G - Q2] Why does \"Over-smoothing\" occur in deep GNNs?",
    options: [
      "Because weights become infinite during backpropagation.",
      "Repeated neighborhood averaging causes node features to converge toward a global mean, destroying local distinctiveness.",
      "When the dataset lacks proper feature labels.",
      "Because learning rate decays to absolute zero."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-g-3",
    question: "[SET G - Q3] Why do GNNs (like GIN) prefer Sum aggregation over Mean or Max?",
    options: [
      "Sum is computationally faster to calculate than average.",
      "Sum is an injective function that captures the full distribution of a neighborhood, whereas Mean/Max lose information.",
      "Mean and Max aggregation trigger NaN gradient errors.",
      "Sum aggregation completely eliminates the need for activation functions."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-g-4",
    question: "[SET G - Q4] Why is \"Vanishing Gradient\" more common in Sigmoid than ReLU?",
    options: [
      "Sigmoid is only used in shallow models.",
      "Sigmoid's derivative saturates near 0 and 1, causing gradients to diminish; ReLU provides a constant gradient of 1 for positive values.",
      "ReLU requires complex numerical integration.",
      "Sigmoid consumes double the GPU memory compared to ReLU."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-g-5",
    question: "[SET G - Q5] Why are \"Residual Connections\" essential for very deep networks?",
    options: [
      "They decrease the model's total parameters.",
      "They provide an identity shortcut for gradients to bypass non-linearities, ensuring error signals reach early layers.",
      "They automatically clean noisy inputs.",
      "They replace standard weights with constant ones."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-g-6",
    question: "[SET G - Q6] Why is \"Weight Initialization\" (e.g., He/Xavier) critical for convergence?",
    options: [
      "It removes all negative parameters from the model.",
      "It stabilizes the variance of signals across layers, preventing activations from exploding or vanishing.",
      "It bypasses the need for training entirely.",
      "It enforces strict binary classification boundaries."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-g-7",
    question: "[SET G - Q7] Why does \"Dropout\" improve model generalization?",
    options: [
      "By deleting half of the dataset rows at each epoch.",
      "By randomly deactivating neurons, it prevents weight reliance on specific neighbors, forcing robust feature learning.",
      "It accelerates processing speeds on CPU systems.",
      "It matches the training error exactly to zero."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-g-8",
    question: "[SET G - Q8] Why is the Scaling Factor (1 / sqrt(d_k)) used in Dot-Product Attention?",
    options: [
      "To prevent dot products from growing too large in high dimensions, which would push Softmax into flat regions.",
      "To map sequence indices directly to floating numbers.",
      "To accelerate matrix operations on multiple CPU cores.",
      "To eliminate the need for Positional Embeddings."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-g-9",
    question: "[SET G - Q9] Why is \"Causal Masking\" required in Transformer Decoders?",
    options: [
      "To decrease context length dynamically.",
      "To prevent the model from looking at future tokens during training, ensuring it predicts based on preceding context.",
      "To regularize word embeddings.",
      "To map target outputs into continuous values."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Hard"
  },
  {
    _id: "set-g-10",
    question: "[SET G - Q10] Why use \"Teacher Forcing\" during LLM training?",
    options: [
      "To feed the ground-truth previous token instead of the model's own prediction, stabilizing training.",
      "To force the model to output text in a specific language.",
      "To decrease training dataset sizes dramatically.",
      "To bypass the self-attention layer completely during decoding."
    ],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Hard"
  },

  // ==================== SET H (Statistics, SQL, & ML Theory) ====================
  {
    _id: "set-h-1",
    question: "[SET H - Q1] Why does Batch Normalization improve neural network training?",
    options: [
      "It increases dataset size",
      "It reduces internal covariate shift and stabilizes gradients",
      "It removes overfitting completely",
      "It replaces activation functions"
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-h-2",
    question: "[SET H - Q2] In hypothesis testing, a low p-value (< 0.05) indicates:",
    options: [
      "The null hypothesis is always false",
      "The alternative hypothesis is always true",
      "The observed result is unlikely under the null hypothesis",
      "The sample size is too small"
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-h-3",
    question: "[SET H - Q3] Why is window function preferred over GROUP BY in feature engineering?",
    options: [
      "Window functions modify the table",
      "GROUP BY is faster always",
      "Window functions preserve row-level data",
      "GROUP BY supports deep learning"
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-h-4",
    question: "[SET H - Q4] What problem does the vanishing gradient mainly affect?",
    options: ["Shallow networks", "Linear regression", "Very deep neural networks", "Decision trees"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-h-5",
    question: "[SET H - Q5] Why is variance important in the bias–variance tradeoff?",
    options: [
      "It measures data size",
      "It shows model sensitivity to training data",
      "It removes noise",
      "It increases accuracy"
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-h-6",
    question: "[SET H - Q6] Which SQL operation is MOST useful to detect data leakage in time-series ML models?",
    options: ["JOIN without condition", "ORDER BY timestamp", "LIMIT", "DISTINCT"],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-h-7",
    question: "[SET H - Q7] Why are ReLU activations preferred over sigmoid in deep networks?",
    options: [
      "ReLU outputs probabilities",
      "ReLU avoids vanishing gradients for positive values",
      "ReLU is computationally expensive",
      "ReLU removes overfitting"
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-h-8",
    question: "[SET H - Q8] Which situation violates the assumption of independent samples?",
    options: ["Random sampling", "Time-series data", "Large datasets", "Balanced classes"],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-h-9",
    question: "[SET H - Q9] Which SQL concept is critical when building incremental ML datasets?",
    options: ["DELETE", "TRUNCATE", "PRIMARY KEY", "WHERE last_updated > previous_run_time"],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Medium"
  },
  {
    _id: "set-h-10",
    question: "[SET H - Q10] Why does cross-entropy loss work better than MSE for classification?",
    options: [
      "It penalizes large errors more effectively",
      "It aligns with probability distributions and log-likelihood",
      "It is simpler to compute",
      "It removes the need for softmax"
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Medium"
  },

  // ==================== SET I (Professional Ethics & Soft Skills) ====================
  {
    _id: "set-i-1",
    question: "[SET I - Q1] When evaluating effective communication for a candidate, he/she must have:",
    options: [
      "Clarity and Conciseness only",
      "Empathy and emotional intelligence only",
      "Proficiency in written communication only",
      "All of the above (Clarity, Conciseness, Empathy, Written Proficiency)"
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-i-2",
    question: "[SET I - Q2] HR allowed a candidate to ask questions at the end of the interview. If you were that candidate, which question would you have asked?",
    options: [
      "What is the salary",
      "Tell me more about the work culture",
      "Do you have any training facilities after joining?",
      "May I get a suitable location as per my choice?"
    ],
    correctAnswer: "D",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-i-3",
    question: "[SET I - Q3] You are passing by a road. Which one is ethical as in your opinion?",
    options: ["Spitting", "Driving faster", "Helping a senior person to cross", "Going to the opposite side randomly"],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-i-4",
    question: "[SET I - Q4] Your best friend asked for help in the exam. How will you do that?",
    options: [
      "You will help him to find the right answer during the test.",
      "You will help him to clear the doubts in the chapter before the exams."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-i-5",
    question: "[SET I - Q5] You are instructed to come to class on time. One day you are stuck in a traffic jam. How will you deal with the situation with your faculty?",
    options: [
      "You will ride faster to catch up.",
      "You will come at normal, safe speed and explain the scenario with proof."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-i-6",
    question: "[SET I - Q6] How will you greet your seniors?",
    options: ["Hey, Good morning", "Good morning Sir/Ma'am"],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-i-7",
    question: "[SET I - Q7] Ram was not selected in the interview round despite being a good student. What should he do?",
    options: [
      "Blame the company's selection criteria.",
      "Decide to never appear in interviews again.",
      "Analyze his Strengths & Weaknesses and focus more on Verbal and nonverbal communication.",
      "Complain to the college placements department."
    ],
    correctAnswer: "C",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-i-8",
    question: "[SET I - Q8] Imagine a situation where you have to correct your mistake in front of the interview panel. How will you say it?",
    options: [
      "Mistake is obvious. So this happened.",
      "I apologise for my answer. I will work on it.",
      "I read it from somewhere. So this is not my fault."
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-i-9",
    question: "[SET I - Q9] Are written communication skills as important as verbal skills?",
    options: ["Yes, absolutely", "No, verbal is far more important"],
    correctAnswer: "A",
    marks: 10,
    difficulty: "Easy"
  },
  {
    _id: "set-i-10",
    question: "[SET I - Q10] A good leader should:",
    options: [
      "Micromanage every single task",
      "Encourage team inputs and collaborate",
      "Make all critical decisions alone",
      "Avoid constructive feedback at all costs"
    ],
    correctAnswer: "B",
    marks: 10,
    difficulty: "Easy"
  }
];
