<?php
	$id = $_GET['id'];
	$sql = "SELECT * FROM klanten WHERE Id='$id'";

	$result = $conn->prepare($sql);
	$result->bindParam(':id', $id);
	$result->execute();
	$customer = $result->fetch(PDO::FETCH_ASSOC);

?>

<h1>Klant wijzigen</h1>
<form id="formUserRegister" method="post" action="php/klantWijzigen.php">
	<span>Voornaam:</span>
	<br>
	<input type="text" name="voornaam" class="inputText" value="<?php echo $customer['Voornaam']?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['voornaam'])){echo $_SESSION['meldingen']['voornaam'];} ?></span>
	<br>
	<br>
	<span>Achternaam:</span>
	<br>
	<input type="text" name="achternaam" class="inputText" value="<?php echo $customer['Achternaam']?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['achternaam'])){echo $_SESSION['meldingen']['achternaam'];} ?></span>
	<br>
	<br>
	<span>Tussenvoegsel: *</span>
	<br>
	<input type="text" name="tussenvoegsel" class="inputText" value="<?php if(isset($customer['Tussenvoegsel'])){echo $customer['Tussenvoegsel'];}?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['tussenvoegsel'])){echo $_SESSION['meldingen']['tussenvoegsel'];} ?></span>
	<br>
	<br>
	<span>Email:</span>
	<br>
	<input type="text" name="email" class="inputText" value="<?php echo $customer['Email']?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['email'])){echo $_SESSION['meldingen']['email'];} ?></span>
	<br>
	<br>
	<span>Woonplaats:</span>
	<br>
	<input type="text" name="woonplaats" class="inputText" value="<?php echo $customer['Woonplaats']?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['woonplaats'])){echo $_SESSION['meldingen']['woonplaats'];} ?></span>
	<br>
	<br>
	<span>Straat:</span>
	<br>
	<input type="text" name="straat" class="inputText" value="<?php echo $customer['Straat']?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['straat'])){echo $_SESSION['meldingen']['straat'];} ?></span>
	<br>
	<br>
	<span>Huisnummer:</span>
	<br>
	<input type="text" name="huisnummer" class="inputText" value="<?php echo $customer['Huisnummer']?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['huisnummer'])){echo $_SESSION['meldingen']['huisnummer'];} ?></span>
	<br>
	<br>
	<span>Postcode:</span>
	<br>
	<input type="text" name="postcode" class="inputText" value="<?php echo $customer['Postcode']?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['postcode'])){echo $_SESSION['meldingen']['postcode'];} ?></span>
	<br>
	<br>
	<span>Telefoonnummer:</span>
	<br>
	<input type="text" name="telefoonnummer" class="inputText" value="<?php echo $customer['Telefoonnummer']?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['telefoonnummer'])){echo $_SESSION['meldingen']['telefoonnummer'];} ?></span>
	<br>
	<br>
	<br>
	<br>
	<input type="hidden" name="id" value="<?php echo $customer['Id'];?>">
	<input type='submit' name ='action' value='Toevoegen'/>
</form>

<?php
	unset($_SESSION['meldingen']);
?>