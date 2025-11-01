using UnityEngine;

public class QuitGame : MonoBehaviour
{
    public void QuitApp()
    {
        Debug.Log("Quit button pressed!");

#if UNITY_EDITOR
        UnityEditor.EditorApplication.isPlaying = false;
#else
        Application.Quit();
#endif
    }
}