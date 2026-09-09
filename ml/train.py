from sklearn.model_selection import train_test_split, GridSearchCV
import xgboost as xgb
import pandas as pd

training_table = pd.read_csv("training_table.csv")
X = training_table.drop(columns=["label"])
y = training_table["label"]

# stratify=y keeps the 200:55 class ratio consistent in both splits -- see Example 2
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# the full search range -- wider than Example 3's toy grid, now that the pipeline is proven
param_grid = {
    "max_depth": [3, 4, 5, 6],
    "learning_rate": [0.01, 0.05, 0.1, 0.2],
    "n_estimators": [100, 200, 300],
}

search = GridSearchCV(
    xgb.XGBClassifier(eval_metric="logloss"),
    param_grid, cv=5, scoring="roc_auc", n_jobs=-1  # n_jobs=-1 uses all CPU cores
)
search.fit(X_train, y_train)

print("Best params:", search.best_params_)
print("Best CV AUC:", search.best_score_)
print("Held-out test AUC:", search.score(X_test, y_test))  # the honest, unbiased check

search.best_estimator_.save_model("gehirn_trained_model.json")