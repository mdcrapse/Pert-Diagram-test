using UnityEngine;
using TMPro;
using UnityEngine.UI;
using System;
using System.Collections.Generic;

public class CheckAnswers : MonoBehaviour
{
    [System.Serializable]
    public class TaskNode
    {
        public string taskName;
        public TMP_InputField ES;
        public TMP_InputField Duration;
        public TMP_InputField EF;
        public TMP_InputField LS;
        public TMP_InputField Slack;
        public TMP_InputField LF;
    }

    [Header("Scene References")]
    public TaskNode[] tasks;            
    public TMP_Text resultText;        
    public TMP_Text exampleText;         
    public Button checkButton;           

    private int currentSetIndex;
    private bool hasChecked = false;

    private Color correctColor = new Color(0.25f, 0.75f, 0.25f);   // green
    private Color wrongColor = new Color(0.9f, 0.25f, 0.25f);      // red
    private Color resetColor; 

    private (string Task, int Dur, string Pred, int ES, int EF, int LS, int LF, int Slack)[][] datasets;

    void Awake()
    {
        ColorUtility.TryParseHtmlString("#25C0AD", out resetColor);
        BuildDatasets();
        LoadRandomDataset();
        checkButton.onClick.AddListener(OnCheckButtonPressed);
    }

    // ------------------------------
    // BUILD THE 10 REAL PERT DATASETS
    // ------------------------------
    void BuildDatasets()
    {
        datasets = new[]
        {
            new[] { // 1
                ("A",5,"-",0,5,0,5,0),
                ("B",3,"A",5,8,5,8,0),
                ("C",4,"A",5,9,5,9,0),
                ("D",2,"B,C",9,11,9,11,0),
                ("E",3,"D",11,14,11,14,0),
                ("F",5,"D",11,16,11,16,0),
                ("G",2,"E,F",16,18,16,18,0)
            },
            new[] { // 2
                ("A",6,"-",0,6,0,6,0),
                ("B",4,"A",6,10,6,10,0),
                ("C",5,"A",6,11,6,11,0),
                ("D",3,"B,C",11,14,11,14,0),
                ("E",4,"D",14,18,14,18,0),
                ("F",6,"D",14,20,14,20,0),
                ("G",3,"E,F",20,23,20,23,0)
            },
            new[] { // 3
                ("A",7,"-",0,7,0,7,0),
                ("B",6,"A",7,13,7,13,0),
                ("C",3,"A",7,10,7,10,0),
                ("D",3,"B,C",13,16,13,16,0),
                ("E",5,"D",16,21,16,21,0),
                ("F",7,"D",16,23,16,23,0),
                ("G",9,"E,F",23,32,23,32,0)
            },
            new[] { // 4
                ("A",4,"-",0,4,0,4,0),
                ("B",5,"A",4,9,4,9,0),
                ("C",3,"A",4,7,4,7,0),
                ("D",2,"B,C",9,11,9,11,0),
                ("E",5,"D",11,16,11,16,0),
                ("F",2,"D",11,13,11,13,0),
                ("G",4,"E,F",16,20,16,20,0)
            },
            new[] { // 5
                ("A",3,"-",0,3,0,3,0),
                ("B",6,"A",3,9,3,9,0),
                ("C",2,"A",3,5,3,5,0),
                ("D",5,"B,C",9,14,9,14,0),
                ("E",3,"D",14,17,14,17,0),
                ("F",6,"D",14,20,14,20,0),
                ("G",5,"E,F",20,25,20,25,0)
            },
            new[] { // 6
                ("A",8,"-",0,8,0,8,0),
                ("B",4,"A",8,12,8,12,0),
                ("C",5,"A",8,13,8,13,0),
                ("D",3,"B,C",13,16,13,16,0),
                ("E",4,"D",16,20,16,20,0),
                ("F",2,"D",16,18,16,18,0),
                ("G",5,"E,F",20,25,20,25,0)
            },
            new[] { // 7
                ("A",5,"-",0,5,0,5,0),
                ("B",5,"A",5,10,5,10,0),
                ("C",3,"A",5,8,5,8,0),
                ("D",4,"B,C",10,14,10,14,0),
                ("E",5,"D",14,19,14,19,0),
                ("F",3,"D",14,17,14,17,0),
                ("G",6,"E,F",19,25,19,25,0)
            },
            new[] { // 8
                ("A",9,"-",0,9,0,9,0),
                ("B",3,"A",9,12,9,12,0),
                ("C",5,"A",9,14,9,14,0),
                ("D",4,"B,C",14,18,14,18,0),
                ("E",5,"D",18,23,18,23,0),
                ("F",3,"D",18,21,18,21,0),
                ("G",4,"E,F",23,27,23,27,0)
            },
            new[] { // 9
                ("A",6,"-",0,6,0,6,0),
                ("B",4,"A",6,10,6,10,0),
                ("C",6,"A",6,12,6,12,0),
                ("D",5,"B,C",12,17,12,17,0),
                ("E",4,"D",17,21,17,21,0),
                ("F",3,"D",17,20,17,20,0),
                ("G",2,"E,F",21,23,21,23,0)
            },
            new[] { // 10
                ("A",7,"-",0,7,0,7,0),
                ("B",4,"A",7,11,7,11,0),
                ("C",5,"A",7,12,7,12,0),
                ("D",6,"B,C",12,18,12,18,0),
                ("E",3,"D",18,21,18,21,0),
                ("F",2,"D",18,20,18,20,0),
                ("G",7,"E,F",21,28,21,28,0)
            }
        };
    }

    // ------------------------------
    // LOAD NEW DATASET
    // ------------------------------
    void LoadRandomDataset()
    {
        currentSetIndex = UnityEngine.Random.Range(0, datasets.Length);
        var set = datasets[currentSetIndex];

        string example = "Task   Len   Pred\n";
        foreach (var t in set)
            example += $"{t.Task,-8}{t.Dur,-7}{t.Pred}\n";
        exampleText.text = example;

        ResetAllFields();
    }

    // ------------------------------
    // BUTTON HANDLER
    // ------------------------------
    void OnCheckButtonPressed()
    {
        if (!hasChecked)
        {
            CheckAll();
            hasChecked = true;
            checkButton.GetComponentInChildren<TMP_Text>().text = "Try Again";
        }
        else
        {
            hasChecked = false;
            checkButton.GetComponentInChildren<TMP_Text>().text = "Check Answers";
            LoadRandomDataset();
        }
    }

    // ------------------------------
    // CHECK ALL ANSWERS
    // ------------------------------
    void CheckAll()
    {
        var set = datasets[currentSetIndex];
        int totalBoxes = 0;
        int correctBoxes = 0;

        for (int i = 0; i < tasks.Length; i++)
        {
            if (i >= set.Length) break;

            var t = tasks[i];
            var correct = set[i];

            correctBoxes += CheckField(t.ES, correct.ES);
            correctBoxes += CheckField(t.Duration, correct.Dur);
            correctBoxes += CheckField(t.EF, correct.EF);
            correctBoxes += CheckField(t.LS, correct.LS);
            correctBoxes += CheckField(t.Slack, correct.Slack);
            correctBoxes += CheckField(t.LF, correct.LF);

            totalBoxes += 6;
        }

        float percent = (float)correctBoxes / totalBoxes * 100f;
        resultText.text = $" You got {correctBoxes}/{totalBoxes} correct ({percent:0.0}%)";
    }

    int CheckField(TMP_InputField field, int correctVal)
    {
        if (field == null) return 0;
        if (int.TryParse(field.text, out int v))
        {
            bool isCorrect = v == correctVal;
            field.image.color = isCorrect ? correctColor : wrongColor;
            return isCorrect ? 1 : 0;
        }
        else
        {
            field.image.color = wrongColor;
            return 0;
        }
    }

   void ResetAllFields()
    {
    foreach (var t in tasks)
    {
        if (t.ES)
        {
            t.ES.text = "ES: ";
            if (t.ES.image != null) t.ES.image.color = resetColor;
        }
        if (t.Duration)
        {
            t.Duration.text = "Duration: ";
            if (t.Duration.image != null) t.Duration.image.color = resetColor;
        }
        if (t.EF)
        {
            t.EF.text = "EF: ";
            if (t.EF.image != null) t.EF.image.color = resetColor;
        }
        if (t.LS)
        {
            t.LS.text = "LS: ";
            if (t.LS.image != null) t.LS.image.color = resetColor;
        }
        if (t.Slack)
        {
            t.Slack.text = "Slack: ";
            if (t.Slack.image != null) t.Slack.image.color = resetColor;
        }
        if (t.LF)
        {
            t.LF.text = "LF: ";
            if (t.LF.image != null) t.LF.image.color = resetColor;
        }
    }

    resultText.text = " ";
    }

    void ResetField(TMP_InputField field)
    {
        field.text = "";
        if (field.image != null)
            field.image.color = resetColor;
    }
}