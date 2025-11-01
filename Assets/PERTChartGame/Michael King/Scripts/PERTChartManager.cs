using UnityEngine;
using TMPro;
using UnityEngine.UI;
using System.Collections.Generic;

public class PERTChartManager : MonoBehaviour
{
    [System.Serializable]
    public class TaskBox
    {
        public string taskName;
        public TMP_InputField ES_Input;
        public TMP_InputField Duration_Input;
        public TMP_InputField EF_Input;
        public TMP_InputField LS_Input;
        public TMP_InputField Slack_Input;
        public TMP_InputField LF_Input;
    }

    [Header("All Task Boxes in Scene")]
    public List<TaskBox> taskBoxes = new List<TaskBox>();

    [Header("UI References")]
    public TMP_Text resultText;
    public Button checkButton;

   
    private Dictionary<string, (int ES, int Dur, int EF, int LS, int Slack, int LF)> correctValues =
        new Dictionary<string, (int, int, int, int, int, int)>
    {
        {"A", (0, 7, 7, 0, 0, 7)},
        {"B", (7, 6, 13, 7, 0, 13)},
        {"C", (13, 3, 16, 13, 0, 16)},
        {"D", (16, 3, 19, 16, 0, 19)},
        {"E", (7, 5, 12, 7, 0, 12)},
        {"F", (12, 7, 19, 12, 0, 19)},
        {"G", (19, 16, 35, 19, 0, 35)}
    };

    private void Start()
    {
        if (checkButton != null)
            checkButton.onClick.AddListener(CheckAll);
    }

    public void CheckAll()
    {
        Debug.Log("Checking answers...");

        int correct = 0;
        int total = 0;

        foreach (var box in taskBoxes)
        {
            if (!correctValues.ContainsKey(box.taskName))
            {
                Debug.LogWarning($"No data for {box.taskName}");
                continue;
            }

            var correctData = correctValues[box.taskName];
            int correctFields = 0;

            correctFields += Compare(box.ES_Input, correctData.ES);
            correctFields += Compare(box.Duration_Input, correctData.Dur);
            correctFields += Compare(box.EF_Input, correctData.EF);
            correctFields += Compare(box.LS_Input, correctData.LS);
            correctFields += Compare(box.Slack_Input, correctData.Slack);
            correctFields += Compare(box.LF_Input, correctData.LF);

            total += 6;
            correct += correctFields;

            
            var img = box.ES_Input.transform.root.GetComponent<Image>();
            if (img != null)
                img.color = (correctFields == 6) ? new Color(0.7f, 1f, 0.7f) : new Color(1f, 0.7f, 0.7f);
        }

        float percent = (float)correct / total * 100f;
        resultText.text = $" You got {correct}/{total} correct ({percent:0.0}%)";
        Debug.Log($"Score: {correct}/{total}");
    }

    private int Compare(TMP_InputField field, int correctVal)
    {
        if (field == null || string.IsNullOrWhiteSpace(field.text)) return 0;
        if (int.TryParse(field.text, out int val) && val == correctVal)
            return 1;
        return 0;
    }
}