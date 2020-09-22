<?php
	require "php/connect.php";

	$id = $_GET['id'];
	$sql = "SELECT * FROM gebruikers WHERE Id='$id'";

	$result = $conn->prepare($sql);
	$result->bindParam(':id', $id);
	$result->execute();
	$user = $result->fetch(PDO::FETCH_ASSOC);
?>

<h1>Gebruiker wijzigen</h1>
<form id="formUserRegister" method="post" action="php/gebruikerWijzigen.php">
	<span>Gebruikersnaam:</span>
	<br>
	<input type="text" name="naam" class="inputText" value="<?php echo $user['Naam']?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['naam'])){echo $_SESSION['meldingen']['naam'];} ?></span>
	<br>
	<br>
	<span>Email:</span>
	<br>
	<input type="text" name="email" class="inputText" value="<?php echo $user['Email']?>">
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['email'])){echo $_SESSION['meldingen']['email'];} ?></span>
	<br>
	<br>
	<span>Rol:</span>
	<br>
	<select name="rol">
		<option selected>---</option>
		<option <?php if($user['Rol'] == 1){ echo 'selected';}?> value="1">Monteur</option>
		<option <?php if($user['Rol'] == 2){ echo 'selected';}?> value="2">Klantenservice</option>
		<option <?php if($user['Rol'] == 3){ echo 'selected';}?> value="3">Admin</option>
	</select>
	<br>
	<span class="validationError"><?php if(isset($_SESSION['meldingen']['rol'])){echo $_SESSION['meldingen']['rol'];} ?></span>
	<br>
	<br>
	<input type="hidden" name="id" value="<?php echo $user['Id'];?>">
	<input type='submit' value='Aanpassen'/>
</form>
<?php
	unset($_SESSION['meldingen']);
?>