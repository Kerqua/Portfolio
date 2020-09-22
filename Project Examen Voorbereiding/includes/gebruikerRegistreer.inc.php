<h1>Nieuwe gebruiker registreren</h1>
<form id="formUserRegister" method="post" action="php/gebruikerRegistreer.php">
	<span>Gebruikersnaam:</span>
	<br>
	<input type="text" name="naam" class="inputText" value="<?php if(isset($_SESSION['gebruikerGegevens']['naam'])){echo $_SESSION['gebruikerGegevens']['naam'];} ?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['naam'])){echo $_SESSION['meldingen']['naam'];} ?></span>
	<br>
	<br>
	<span>Email:</span>
	<br>
	<input type="text" name="email" class="inputText" value="<?php if(isset($_SESSION['gebruikerGegevens']['email'])){echo $_SESSION['gebruikerGegevens']['email'];}?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['email'])){echo $_SESSION['meldingen']['email'];} ?></span>
	<br>
	<br>
	<span>Wachtwoord:</span>
	<br>
	<input type='password' name='wachtwoord' class='inputText' 
	<br>
	<span class="validationError"></span>
	<br>
	<br>
	<span>Herhaling wachtwoord:</span>
	<br>
	<input type='password' name='wachtwoordHerhaal' class='inputText'>
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['wachtwoord'])){echo $_SESSION['meldingen']['wachtwoord'];} ?></span>
	<br>
	<br>
	<span>Rol:</span>
	<br>
	<select name="rol">
		<option selected>---</option>
		<option <?php if(isset($_SESSION['gebruikerGegevens']['rol'])){if($_SESSION['gebruikerGegevens']['rol'] == 1){ echo 'selected';}}?> value="1">Monteur</option>
		<option <?php if(isset($_SESSION['gebruikerGegevens']['rol'])){if($_SESSION['gebruikerGegevens']['rol'] == 2){ echo 'selected';}}?> value="2">Klantenservice</option>
		<option <?php if(isset($_SESSION['gebruikerGegevens']['rol'])){if($_SESSION['gebruikerGegevens']['rol'] == 3){ echo 'selected';}}?> value="3">Admin</option>
	</select>
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['rol'])){echo $_SESSION['meldingen']['rol'];} ?></span>
	<br>
	<br>
	<input type='submit' name ='action' value='Toevoegen'/>
</form>
<?php
	unset($_SESSION['meldingen']);
	unset($_SESSION['gebruikerGegevens']);
?>