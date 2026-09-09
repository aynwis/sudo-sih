import matplotlib
matplotlib.use("Agg")  # non-interactive backend -- see Example 2
import shap
import xgboost as xgb
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

model = xgb.XGBClassifier()
model.load_model("gehirn_trained_model.json")

training_table = pd.read_csv("training_table.csv")
X_train = training_table.drop(columns=["label"])

explainer = shap.TreeExplainer(model)   # tree-specific, fast -- see Hint 1
shap_values = explainer.shap_values(X_train)

shap.summary_plot(shap_values, X_train, show=False)  # show=False since we're saving, not displaying
plt.tight_layout()
plt.savefig("shap_feature_importance.png", dpi=150)
plt.close()

# the ranked list behind the chart -- see Example 3
mean_abs = np.abs(shap_values).mean(axis=0)
top_feature = X_train.columns[np.argmax(mean_abs)]
print(f"Top driver: {top_feature}")