using System.ComponentModel.DataAnnotations;

namespace alloy13preview.Models;

public class LoginViewModel
{
    [Required]
    public string Username { get; set; }

    [Required]
    public string Password { get; set; }
}
