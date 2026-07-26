# GitHub Setup

The local repository is initialized on branch `main` with the first commit:

```text
7c50750 Initial full-stack Airbnb clone
```

GitHub CLI is installed at:

```text
C:\Program Files\GitHub CLI\gh.exe
```

If `gh` is not available in a new terminal, close and reopen PowerShell so the PATH refreshes, or run it with the full path above.

## Option 1: GitHub CLI

Authenticate:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" auth login --hostname github.com --git-protocol ssh --web
```

Create a private repository and push:

```powershell
cd E:\Projects\airbnb-clone
& "C:\Program Files\GitHub CLI\gh.exe" repo create airbnb-clone --private --source . --remote origin --push
```

Create a public repository and push:

```powershell
cd E:\Projects\airbnb-clone
& "C:\Program Files\GitHub CLI\gh.exe" repo create airbnb-clone --public --source . --remote origin --push
```

## Option 2: SSH Key

The local SSH public key is:

```text
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJLTQ9/lsiwD8+4buTEiLK6xpGcVaXSzj225z4Zc+O5N prabalcaptprice@gmail.com
```

Add it in GitHub:

```text
GitHub → Settings → SSH and GPG keys → New SSH key
```

Then create an empty GitHub repository named `airbnb-clone` and connect it:

```powershell
cd E:\Projects\airbnb-clone
git remote add origin git@github.com:<your-username>/airbnb-clone.git
git push -u origin main
```

## Verify

```powershell
git remote -v
git status
```

Expected result:

```text
On branch main
nothing to commit, working tree clean
```
