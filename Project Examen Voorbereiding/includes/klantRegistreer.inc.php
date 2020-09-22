<h1>Nieuwe klant registreren</h1>
<form id="formUserRegister" method="post" action="php/klantRegistreer.php">
	<span>Voornaam:</span>
	<br>
	<input type="text" name="voornaam" class="inputText" value="<?php if(isset($_SESSION['klantenGegevens']['voornaam'])){echo $_SESSION['klantenGegevens']['voornaam'];} ?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['voornaam'])){echo $_SESSION['meldingen']['voornaam'];} ?></span>
	<br>
	<br>
	<span>Achternaam:</span>
	<br>
	<input type="text" name="achternaam" class="inputText" value="<?php if(isset($_SESSION['klantenGegevens']['achternaam'])){echo $_SESSION['klantenGegevens']['achternaam'];} ?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['achternaam'])){echo $_SESSION['meldingen']['achternaam'];} ?></span>
	<br>
	<br>
	<span>Tussenvoegsel: *</span>
	<br>
	<input type="text" name="tussenvoegsel" class="inputText" value="<?php if(isset($_SESSION['klantenGegevens']['tussenvoegsel'])){echo $_SESSION['klantenGegevens']['tussenvoegsel'];} ?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['tussenvoegsel'])){echo $_SESSION['meldingen']['tussenvoegsel'];} ?></span>
	<br>
	<br>
	<span>Email:</span>
	<br>
	<input type="text" name="email" class="inputText" value="<?php if(isset($_SESSION['klantenGegevens']['email'])){echo $_SESSION['klantenGegevens']['email'];} ?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['email'])){echo $_SESSION['meldingen']['email'];} ?></span>
	<br>
	<br>
	<span>Woonplaats:</span>
	<br>
	<input type="text" name="woonplaats" class="inputText" value="<?php if(isset($_SESSION['klantenGegevens']['woonplaats'])){echo $_SESSION['klantenGegevens']['woonplaats'];} ?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['woonplaats'])){echo $_SESSION['meldingen']['woonplaats'];} ?></span>
	<br>
	<br>
	<span>Straat:</span>
	<br>
	<input type="text" name="straat" class="inputText" value="<?php if(isset($_SESSION['klantenGegevens']['straat'])){echo $_SESSION['klantenGegevens']['straat'];} ?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['straat'])){echo $_SESSION['meldingen']['straat'];} ?></span>
	<br>
	<br>
	<span>Huisnummer:</span>
	<br>
	<input type="text" name="huisnummer" class="inputText" value="<?php if(isset($_SESSION['klantenGegevens']['naam'])){echo $_SESSION['klantenGegevens']['naam'];} ?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['huisnummer'])){echo $_SESSION['meldingen']['huisnummer'];} ?></span>
	<br>
	<br>
	<span>Postcode:</span>
	<br>
	<input type="text" name="postcode" class="inputText" value="<?php if(isset($_SESSION['klantenGegevens']['naam'])){echo $_SESSION['klantenGegevens']['naam'];} ?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['postcode'])){echo $_SESSION['meldingen']['postcode'];} ?></span>
	<br>
	<br>
	<span>Telefoonnummer:</span>
	<br>
	<input type="text" name="telefoonnummer" class="inputText" value="<?php if(isset($_SESSION['klantenGegevens']['naam'])){echo $_SESSION['klantenGegevens']['naam'];} ?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['telefoonnummer'])){echo $_SESSION['meldingen']['telefoonnummer'];} ?></span>
	<br>
	<br>
	<br>
	<br>
	<input type='submit' name ='action' value='Toevoegen'/>
</form>

<?php
	unset($_SESSION['meldingen']);
	unset($_SESSION['klantenGegevens']);
?>