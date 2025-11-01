using UnityEngine;
using UnityEngine.SceneManagement;

public class MainMenu : MonoBehaviour
{
    
    public void StartGame() => SceneManager.LoadScene("PERTGame");
    public void QuitGame()
    {
        Application.Quit();
#if UNITY_EDITOR
        Debug.Log("Quit requested (won't quit in Editor).");
#endif
    }
}
