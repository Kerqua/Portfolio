<form id="formLogin" method="post" action="php/login.php">
	<img src="img/image-placeholder.png" id="imageLogin" style="width:100%;">
	<br>
	<br>
	<span>Gebruikersnaam:</span>
	<br>
	<input type="text" name="naam" class="inputText">
	<br>
	<br>
	<span>Wachtwoord:</span>
	<br>
	<input type="password" name="wachtwoord" class="inputText">
	<br>
	<br>
	<input type="submit" value="Log in"/>
	<span>
		<?php
			if(isset($_SESSION["message"])){
				echo $_SESSION["message"];
			}
		?>
	</span>
	<?php
		
	?>
</form>